import { Code, Mono, Table } from "@/components/mcp-ui"

const toolsListJson = `{
  "method": "tools/list"
}`

const discoverResponseJson = `{
  "supportedVersions": ["2026-07-28"],
  "capabilities": {
    "tools": { "listChanged": true },
    "resources": {}
  }
}`

const statelessCallJson = `{
  "method": "tools/call",
  "params": {
    "name": "searchFlights",
    "arguments": {
      "origin": "New York",
      "destination": "Barcelona",
      "date": "2027-06-15"
    },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientCapabilities": {}
    }
  }
}`

const subscribeJson = `{
  "id": 4,
  "method": "subscriptions/listen",
  "params": {
    "notifications": {
      "toolsListChanged": true
    }
  }
}`

const listChangedJson = `{
  "jsonrpc": "2.0",
  "method": "notifications/tools/list_changed",
  "params": {
    "_meta": {
      "io.modelcontextprotocol/subscriptionId": 4
    }
  }
}`

export default function McpArchitecturePage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔌</span>
          <div>
            <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-3">MCP Architecture in Easy English</h1>
            <p className="text-lg text-cyan-800 dark:text-cyan-200 leading-relaxed">
              This lesson uses the same Travel Server example as the MCP server and client lessons. The protocol
              examples follow the <Mono>2026-07-28</Mono> architecture document. The JSON snippets show only the fields
              needed for each explanation.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Host, client, and server */}
      <section className="space-y-4 border-l-4 border-cyan-500 pl-5">
        <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">1. Host, client, and server</h2>
        <ul className="space-y-2">
          <li className="text-sm text-muted-foreground flex gap-2">
            <span className="text-cyan-600">•</span>
            <span>
              <strong className="text-foreground">Host</strong> is the app you use, like VS Code or an AI travel
              planner.
            </span>
          </li>
          <li className="text-sm text-muted-foreground flex gap-2">
            <span className="text-cyan-600">•</span>
            <span>
              <strong className="text-foreground">MCP client</strong> is the part of the app that talks to one MCP
              server. A host can create several clients.
            </span>
          </li>
          <li className="text-sm text-muted-foreground flex gap-2">
            <span className="text-cyan-600">•</span>
            <span>
              <strong className="text-foreground">MCP server</strong> is the program that answers MCP requests. It can
              offer tools, resources, and prompts.
            </span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For example, one travel app can use a Travel client, a Weather client, and a Calendar/Email client. Each
          client talks to its own server.
        </p>
      </section>

      {/* 2. Two layers */}
      <section className="space-y-5 border-l-4 border-blue-500 pl-5">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">2. Why MCP has two layers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
            <p className="font-semibold text-sm mb-1">Data layer</p>
            <p className="text-xs text-muted-foreground">Defines the message and its meaning.</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
            <p className="font-semibold text-sm mb-1">Transport layer</p>
            <p className="text-xs text-muted-foreground">Defines how the message reaches the server.</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Take this request:</p>
          <Code>{toolsListJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">JSON is the format.</strong> It gives you keys and values. The{" "}
            <strong className="text-foreground">MCP data layer</strong> defines that the <Mono>method</Mono> value{" "}
            <Mono>tools/list</Mono> means “Give me your available tools.”
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">The client can send that same message through different transports:</p>
          <Table
            head={["How the MCP server runs", "Transport", "How the client sends the JSON"]}
            rows={[
              [
                <>
                  VS Code starts a local program such as <Mono>node travel-server.js</Mono>.
                </>,
                <strong key="t" className="text-foreground">stdio</strong>,
                <>
                  Writes to the server process’s input (<Mono>stdin</Mono>) and reads replies from its output (
                  <Mono>stdout</Mono>).
                </>,
              ],
              [
                <>
                  You run an HTTP server on your laptop at <Mono>http://localhost:3000/mcp</Mono>.
                </>,
                <strong key="t" className="text-foreground">Streamable HTTP</strong>,
                "Sends an HTTP request to the local URL.",
              ],
              [
                <>
                  The MCP server is deployed remotely at <Mono>https://example.com/mcp</Mono>.
                </>,
                <strong key="t" className="text-foreground">Streamable HTTP</strong>,
                "Sends an HTTP request to the remote URL.",
              ],
            ]}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">
            With stdio, VS Code supplies the input automatically. You don’t have to type into a terminal. A local
            server can use either transport. If you move your server from a local stdio process to an HTTP deployment,
            the connection changes and the rules for messages like <Mono>tools/list</Mono> stay the same.
          </p>
        </div>
      </section>

      {/* 3. Discovery and stateless requests */}
      <section className="space-y-5 border-l-4 border-emerald-500 pl-5">
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">3. Discovery and stateless requests</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Discovery</strong> helps the client learn what the server supports.
        </p>
        <Table
          head={["Request", "What it asks"]}
          rows={[
            [<Mono key="r">server/discover</Mono>, "“Which MCP versions and features do you support?”"],
            [<Mono key="r">tools/list</Mono>, "“Which tools do you offer, and what inputs do they need?”"],
          ]}
        />

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Here’s part of the document’s <Mono>server/discover</Mono> response:
          </p>
          <Code>{discoverResponseJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This server supports that protocol version, offers tools and resources, and can notify clients when its
            tool list changes. The client can reuse the discovery information. The response can include a time limit
            for keeping it in the cache.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Stateless</strong> means a request carries the details the server
            needs to handle it without relying on a previous request. For example, a flight search sends the tool name,
            the route, the date, and the protocol information together:
          </p>
          <Code>{statelessCallJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server can handle that request even if the client skipped <Mono>server/discover</Mono>. In this
            protocol version, servers support the discovery method and clients can choose whether to call it.
          </p>
        </div>
      </section>

      {/* 4. Tool list changes */}
      <section className="space-y-5 border-l-4 border-violet-500 pl-5">
        <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-300">
          4. Get notified when the tool list changes
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Suppose the app knows about <Mono>searchFlights</Mono> and the server later adds <Mono>searchHotels</Mono>.
        </p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Subscribe</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The client asks the server to tell it when the tool list changes. It sends{" "}
            <Mono>subscriptions/listen</Mono> with a filter:
          </p>
          <Code>{subscribeJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server sends <Mono>notifications/subscriptions/acknowledged</Mono> to confirm which updates it agreed
            to send. The stream stays open for future notifications.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Receive the update and refresh the list</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When the server adds <Mono>searchHotels</Mono>, it can send this message on the stream:
          </p>
          <Code>{listChangedJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The <Mono>4</Mono> identifies the subscription. The message has no top-level <Mono>id</Mono>, so the
            server expects no reply to it. The app sends a <strong className="text-foreground">separate</strong>{" "}
            <Mono>tools/list</Mono> request with its own ID, for example <Mono>5</Mono>. The server replies to request{" "}
            <Mono>5</Mono> with the current tool list, including <Mono>searchHotels</Mono>.
          </p>
        </div>

        <div className="bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/50 rounded-lg p-4 space-y-1">
          <h3 className="text-sm font-semibold">What if the app misses an update?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If the app disconnects just before the server adds <Mono>searchHotels</Mono>, it might still have the old
            list when it reconnects. It can call <Mono>tools/list</Mono> again to get the current list and open a new
            subscription for future changes.
          </p>
        </div>
      </section>

      {/* Quick check */}
      <section className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>✅</span> Quick check
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">
              1. The server runs at <Mono>http://localhost:3000/mcp</Mono>. Which transport is it using?
            </p>
            <p className="text-sm text-muted-foreground mt-1">Streamable HTTP.</p>
          </div>
          <div>
            <p className="text-sm font-semibold">
              2. The app receives <Mono>notifications/tools/list_changed</Mono>. How does it get the new list?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              It sends <Mono>tools/list</Mono>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
