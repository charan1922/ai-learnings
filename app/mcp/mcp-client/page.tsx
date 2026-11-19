import { Code, Mono, Table } from "@/components/mcp-ui"

const firstRequestJson = `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "bookVacation",
    "arguments": {
      "outboundFlight": "EX101",
      "returnFlight": "EX102",
      "hotelId": "beachfront-hotel"
    }
  }
}`

const firstResponseJson = `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resultType": "input_required",
    "inputRequests": {
      "bookingConfirmation": {
        "method": "elicitation/create",
        "params": {
          "mode": "form",
          "message": "Please confirm your Barcelona vacation booking: flights June 15-22, beachfront hotel, total $3,000.",
          "requestedSchema": {
            "type": "object",
            "properties": {
              "confirmBooking": {
                "type": "boolean",
                "description": "Confirm the booking (Flights + Hotel = $3,000)"
              },
              "seatPreference": {
                "type": "string",
                "enum": [
                  "window",
                  "aisle",
                  "no preference"
                ],
                "description": "Preferred seat type for flights"
              },
              "roomType": {
                "type": "string",
                "enum": [
                  "sea view",
                  "city view",
                  "garden view"
                ],
                "description": "Preferred room type at hotel"
              },
              "travelInsurance": {
                "type": "boolean",
                "default": false,
                "description": "Add travel insurance ($150)"
              }
            },
            "required": [
              "confirmBooking"
            ]
          }
        }
      }
    },
    "requestState": "opaque-string-from-the-server"
  }
}`

const secondRequestJson = `{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "bookVacation",
    "arguments": {
      "outboundFlight": "EX101",
      "returnFlight": "EX102",
      "hotelId": "beachfront-hotel"
    },
    "inputResponses": {
      "bookingConfirmation": {
        "action": "accept",
        "content": {
          "confirmBooking": true,
          "seatPreference": "window",
          "roomType": "sea view",
          "travelInsurance": false
        }
      }
    },
    "requestState": "opaque-string-from-the-server"
  }
}`

export default function McpClientPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔌</span>
          <div>
            <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-3">Understanding MCP Clients</h1>
            <p className="text-lg text-cyan-800 dark:text-cyan-200 leading-relaxed">
              This lesson continues the Barcelona trip example from <strong>Understanding MCP Servers</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Host, client, and server */}
      <section className="space-y-4 border-l-4 border-cyan-500 pl-5">
        <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">1. Host, client, and server</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong>host</strong> is the app you use. In this example, it’s the AI travel planner. The host creates
          an <strong>MCP client</strong> to communicate with each connected <strong>MCP server</strong>.
        </p>
        <Table
          head={["Client inside the travel app", "Server it talks to", "Example job"]}
          rows={[
            ["Travel client", "Travel Server", "Search flights and book the trip"],
            ["Weather client", "Weather Server", "Check the forecast"],
            ["Calendar/Email client", "Calendar/Email Server", "Add the trip to your calendar"],
          ]}
        />
        <p className="text-sm text-muted-foreground leading-relaxed">
          You use <strong>one app</strong>. In this example, the app uses <strong>three clients</strong> to talk to{" "}
          <strong>three servers</strong>.
        </p>
      </section>

      {/* 2. Elicitation */}
      <section className="space-y-4 border-l-4 border-blue-500 pl-5">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">2. What is elicitation?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Elicitation</strong> is how an MCP server asks you for information it needs to finish a task. For
          example, when the travel app calls <Mono>bookVacation</Mono>, the Travel Server can ask you to confirm the
          $3,000 booking or choose a seat.
        </p>
        <Table
          head={["Mode", "What the app shows you", "Example"]}
          rows={[
            [
              <strong key="m" className="text-foreground">Form mode</strong>,
              "A form in the app",
              "Confirm the booking and choose a window or aisle seat.",
            ],
            [
              <strong key="m" className="text-foreground">URL mode</strong>,
              "A link to another site",
              "Sign in to the airline on its own website.",
            ],
          ]}
        />
        <p className="text-sm text-muted-foreground leading-relaxed">
          The client tells the server which modes it supports. In the version shown in the source document,{" "}
          <Mono>{'"elicitation": {}'}</Mono> means <strong>form mode only</strong>.{" "}
          <Mono>{'"elicitation": {"form": {}, "url": {}}'}</Mono> means the client supports both modes.
        </p>
      </section>

      {/* 3. Form mode */}
      <section className="space-y-5 border-l-4 border-emerald-500 pl-5">
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          3. Form mode with real request and response examples
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The booking uses two round trips. Your interaction with the form happens between them. The document calls
          this <strong>Multi Round-Trip Requests (MRTR)</strong>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          These examples come from the Barcelona booking in the source document. They omit <Mono>_meta</Mono> so you
          can focus on the booking fields.
        </p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">First request — Call the booking tool</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Travel client sends a <Mono>tools/call</Mono> request with the flight and hotel choices.
          </p>
          <Code>{firstRequestJson}</Code>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">First response — Ask for confirmation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Travel Server returns <Mono>{'"resultType": "input_required"'}</Mono>. This means it needs an answer
            before it can finish. The server’s response uses the same <Mono>id</Mono> as the request.
          </p>
          <Code>{firstResponseJson}</Code>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground flex gap-2">
              <span className="text-emerald-600">•</span>
              <span>
                <Mono>inputRequests.bookingConfirmation</Mono> is the form request. Its <Mono>message</Mono> is what
                the app can show you.
              </span>
            </li>
            <li className="text-sm text-muted-foreground flex gap-2">
              <span className="text-emerald-600">•</span>
              <span>
                <Mono>requestedSchema</Mono> tells the client what fields to show and how to check the answers. Only{" "}
                <Mono>confirmBooking</Mono> is required. The client can show <Mono>seatPreference</Mono> as a dropdown
                using the listed choices.
              </span>
            </li>
            <li className="text-sm text-muted-foreground flex gap-2">
              <span className="text-emerald-600">•</span>
              <span>
                <Mono>requestState</Mono> is a value the server gives the client. Think of it as a bookmark. The client
                sends it back unchanged so the server can pick up where it left off.
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Second request — Send your answers</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You confirm the booking, choose a window seat and a sea-view room, and skip insurance. The client calls{" "}
            <Mono>bookVacation</Mono> again with the same arguments and a new <Mono>id</Mono>. It adds your answers
            under <Mono>inputResponses.bookingConfirmation</Mono> and copies back <Mono>requestState</Mono>.
          </p>
          <Code>{secondRequestJson}</Code>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Second response — Get the booking result</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server returns <Mono>{'"resultType": "complete"'}</Mono> with <Mono>id: 2</Mono>. In this example, the
            result says it booked flights EX101 and EX102 and a sea-view room at the beachfront hotel.
          </p>
        </div>
      </section>

      {/* 4. Submit, decline, or close */}
      <section className="space-y-5 border-l-4 border-violet-500 pl-5">
        <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-300">4. Submit, decline, or close the form</h2>
        <Table
          head={["What you do", "What the client sends"]}
          rows={[
            [
              "Submit the form",
              <>
                <Mono>{'"action": "accept"'}</Mono> with your answers in <Mono>content</Mono>
              </>,
            ],
            ["Explicitly decline to provide an answer", <Mono key="a">{'"action": "decline"'}</Mono>],
            ["Dismiss the form without choosing", <Mono key="a">{'"action": "cancel"'}</Mono>],
          ]}
        />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>
            <Mono>{'"action": "accept"'}</Mono> means you submitted the form.
          </strong>{" "}
          The value of <Mono>content.confirmBooking</Mono> says whether you want the booking. You can submit a valid
          form with <Mono>confirmBooking: false</Mono>. If you leave a required answer blank, the client can ask you to
          fill it in before submitting.
        </p>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">What if you close the whole app?</h3>
          <ul className="space-y-2">
            <li className="text-sm text-muted-foreground flex gap-2">
              <span className="text-violet-600">•</span>
              <span>
                <strong>Before confirming:</strong> The app may close without sending a cancel action. In this example,
                the server still needs your confirmation before it can book.
              </span>
            </li>
            <li className="text-sm text-muted-foreground flex gap-2">
              <span className="text-violet-600">•</span>
              <span>
                <strong>After confirming:</strong> If the client already sent the second call, the server may finish
                booking even if you close the app before seeing the result. Check the booking status before trying
                again.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 5. URL mode */}
      <section className="space-y-4 border-l-4 border-amber-500 pl-5">
        <h2 className="text-2xl font-bold text-amber-700 dark:text-amber-300">5. URL mode with the airline example</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Travel Server needs you to sign in to the airline, so it asks the client to show a link.
        </p>
        <ol className="space-y-3">
          {[
            <>The client shows you which server is asking and displays the full URL. It asks before opening the link.</>,
            <>
              You choose <strong>Open link</strong> and sign in on the airline’s website.
            </>,
            <>
              The client knows whether you agreed to open the link. The airline’s site receives the information you
              enter there.
            </>,
          ].map((body, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-amber-500 text-white h-7 w-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Opening the link gives permission to open the page. Signing in happens on the airline website. Use URL mode
          when a separate site needs sensitive information such as a password or payment credentials.
        </p>
      </section>

      {/* 6. Older features */}
      <section className="space-y-4 border-l-4 border-rose-500 pl-5">
        <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-300">6. Older features in the source document</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The MCP version covered in the source document, <Mono>2026-07-28</Mono>, marks <strong>roots</strong> and{" "}
          <strong>sampling</strong> as deprecated.
        </p>
        <Table
          head={["Feature", "What it did", "What the document suggests for new implementations"]}
          rows={[
            [
              <strong key="f" className="text-foreground">Roots</strong>,
              "Let the client tell the server which folders or files it could work with.",
              "Pass the paths through tool arguments, use resource URIs, or configure them on the server.",
            ],
            [
              <strong key="f" className="text-foreground">Sampling</strong>,
              "Let the server ask the client to get a response from an AI model.",
              "Have the server call a model provider’s API directly when it needs an AI response.",
            ],
          ]}
        />
      </section>

      {/* Quick check */}
      <section className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>✅</span> Quick check
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Who asks for booking confirmation?</p>
            <p className="text-sm text-muted-foreground mt-1">
              The Travel Server asks through the MCP client. The host app shows you the question.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">What tells the server that you approved the booking?</p>
            <p className="text-sm text-muted-foreground mt-1">
              <Mono>content.confirmBooking: true</Mono> in the second tool call.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
