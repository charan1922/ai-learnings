import { Code, Mono, Table } from "@/components/mcp-ui"

const toolsCallJson = `{
  "method": "tools/call",
  "params": {
    "name": "searchFlights",
    "arguments": {
      "origin": "New York",
      "destination": "Barcelona",
      "date": "2027-06-15"
    }
  }
}`

const promptsGetJson = `{
  "method": "prompts/get",
  "params": {
    "name": "plan-vacation",
    "arguments": {
      "origin": "New York",
      "destination": "Barcelona",
      "departureDate": "2027-06-15",
      "returnDate": "2027-06-22",
      "budget": "3000",
      "travelers": "2",
      "interests": "beaches, architecture, food"
    }
  }
}`

export default function McpServerPage() {
  const tripSteps = [
    {
      title: "Get the prompt",
      body: (
        <>
          You select <strong>Plan a vacation</strong>, fill in your details, and the app gets the message from the
          Travel Server.
        </>
      ),
    },
    {
      title: "Read the context",
      body: (
        <>
          The app reads the calendar from the Calendar/Email Server and your preferences and past trips from the
          Travel Server.
        </>
      ),
    },
    {
      title: "Search",
      body: (
        <>
          The model asks the app to use <Mono>searchFlights</Mono> and <Mono>searchHotels</Mono> on the Travel Server
          and <Mono>checkWeather</Mono> on the Weather Server. The model proposes a package.
        </>
      ),
    },
    {
      title: "Confirm and book",
      body: (
        <>
          When you approve the package, the app calls <Mono>bookVacation</Mono>. In the example, the Travel Server can
          ask you to confirm through the app. MCP calls that <strong>elicitation</strong>.
        </>
      ),
    },
    {
      title: "Follow up",
      body: (
        <>
          The app calls <Mono>createCalendarEvent</Mono> and <Mono>sendEmail</Mono> on the Calendar/Email Server to
          add the trip and send a confirmation.
        </>
      ),
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔌</span>
          <div>
            <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 mb-3">Understanding MCP Servers</h1>
            <p className="text-lg text-cyan-800 dark:text-cyan-200 leading-relaxed">
              MCP stands for <strong>Model Context Protocol</strong>. It gives an AI app a standard way to talk to
              programs called <strong>MCP servers</strong>.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-cyan-950/60 rounded-lg p-4 border border-cyan-200 dark:border-cyan-700/50">
          <p className="text-sm text-cyan-800 dark:text-cyan-200 leading-relaxed">
            Imagine you ask an AI travel app to find flights from New York to Barcelona. The app sends a request to a
            travel MCP server. The server can look up flights using a flight API and return the results. The app gives
            those results to the model so it can answer you.
          </p>
        </div>
      </div>

      {/* 1. Tools, resources, prompts */}
      <section className="space-y-4 border-l-4 border-cyan-500 pl-5">
        <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">1. Tools, resources, and prompts</h2>
        <Table
          head={["Feature", "What it does", "Example"]}
          rows={[
            [
              <strong key="f" className="text-foreground">Tool</strong>,
              "Runs an operation. The model can ask the app to use it.",
              <Mono key="e">searchFlights</Mono>,
            ],
            [
              <strong key="f" className="text-foreground">Resource</strong>,
              "Gives the app read-only data to share with the model. The app decides what to include.",
              "June calendar availability",
            ],
            [
              <strong key="f" className="text-foreground">Prompt</strong>,
              "Gives the model reusable instructions. The user can choose a prompt in the app.",
              <strong key="e" className="text-foreground">Plan a vacation</strong>,
            ],
          ]}
        />
      </section>

      {/* 2. Tools */}
      <section className="space-y-5 border-l-4 border-blue-500 pl-5">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">2. Tools</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A tool does one job. <Mono>searchFlights</Mono> searches for flights. <Mono>createCalendarEvent</Mono> adds
          an event to your calendar.
        </p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Find a tool with <Mono>tools/list</Mono>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The app asks the server, “What tools do you offer?” The server returns tool definitions. For{" "}
            <Mono>searchFlights</Mono>, the definition gives its name, describes what it does, and lists the required
            inputs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
              <p className="font-semibold text-sm mb-1">
                <Mono>inputSchema</Mono>
              </p>
              <p className="text-xs text-muted-foreground">
                Describes the data going in. Here, the tool needs an origin, a destination, and a date.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
              <p className="font-semibold text-sm mb-1">
                <Mono>outputSchema</Mono>
              </p>
              <p className="text-xs text-muted-foreground">
                When provided, describes the structured data coming back. Here, it describes a list of flights with a
                flight number and a price.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Run a tool with <Mono>tools/call</Mono>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you ask for actual flights from New York to Barcelona, the model can choose <Mono>searchFlights</Mono>.
            The app sends the call and the MCP server runs the search. Here are the main fields of the request.
          </p>
          <Code>{toolsCallJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server can return flight <strong>EX101 for $640</strong>. In the document&apos;s example,{" "}
            <Mono>structuredContent</Mono> contains the result as a JSON object. The <Mono>content</Mono> field also
            includes the same data as text for older clients.
          </p>
        </div>
      </section>

      {/* 3. Resources */}
      <section className="space-y-5 border-l-4 border-emerald-500 pl-5">
        <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">3. Resources</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A resource is information the app can read. Each resource has a <strong>URI</strong>, which is its address.
        </p>
        <Table
          head={["Request", "What the app is asking"]}
          rows={[
            [<Mono key="r">resources/list</Mono>, "“Which direct resources can I read?”"],
            [<Mono key="r">resources/read</Mono>, "“Give me the data at this specific address.”"],
            [<Mono key="r">resources/templates/list</Mono>, "“Which resource addresses can I build by filling in placeholders?”"],
          ]}
        />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Find an address, then read the data</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Calendar/Email Server can list <Mono>calendar://events/2027-06</Mono> as an available resource. The
            app then sends <Mono>resources/read</Mono> with that URI to get your June availability. The server can
            fetch the actual data from a calendar API.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Build an address from a resource template</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The travel server can offer <Mono>{"travel://activities/{city}/{category}"}</Mono>. For Barcelona museums,
            the app fills in the placeholders and reads <Mono>travel://activities/Barcelona/museums</Mono>.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The same template works for other combinations, such as parks in Madrid.
          </p>
        </div>
      </section>

      {/* 4. Prompts */}
      <section className="space-y-5 border-l-4 border-violet-500 pl-5">
        <h2 className="text-2xl font-bold text-violet-700 dark:text-violet-300">4. Prompts</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          An MCP prompt is a reusable set of instructions. In the travel app, <strong>Plan a vacation</strong> could
          appear as a menu item, button, or slash command. The app chooses how to display it.
        </p>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Discover the prompt with <Mono>prompts/list</Mono>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server sends a prompt definition. Think of it as a description of an <strong>empty form</strong>.
          </p>
          <Table
            head={["Field", "What it tells the app"]}
            rows={[
              [
                <Mono key="f">name</Mono>,
                <>
                  Use <Mono>plan-vacation</Mono> when talking to the server.
                </>,
              ],
              [
                <Mono key="f">title</Mono>,
                <>
                  Show <strong>Plan a vacation</strong> to the user.
                </>,
              ],
              [<Mono key="f">description</Mono>, "Explain what the prompt helps with."],
              [
                <Mono key="f">arguments</Mono>,
                "Ask for the origin, destination, departure date, and return date. Budget, traveler count, and interests are optional.",
              ],
            ]}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">
            Get the filled-in prompt with <Mono>prompts/get</Mono>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You select <strong>Plan a vacation</strong> and enter your details. The app sends the prompt name and your
            answers.
          </p>
          <Code>{promptsGetJson}</Code>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The server returns a message that combines your answers with instructions. In this example, the app passes
            it to the model <strong>as a user message</strong>, as if you had typed it yourself. Here is a short
            version of what that message says.
          </p>
          <blockquote className="border-l-4 border-violet-400 bg-violet-50 dark:bg-violet-950/30 rounded-r-lg px-4 py-3 text-sm italic text-muted-foreground">
            Plan a trip for two from New York to Barcelona, June 15–22, 2027, with a $3,000 budget. Search for flights
            and hotels, check the weather, and propose one package.
          </blockquote>
          <p className="text-sm text-muted-foreground leading-relaxed">
            At this point, the server has prepared the instructions. The flight search happens in a separate{" "}
            <Mono>tools/call</Mono> request.
          </p>
        </div>

        <div className="bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>How many round trips?</strong> The first time, the app can use <Mono>prompts/list</Mono> to
            discover the form and <Mono>prompts/get</Mono> to fetch the filled-in prompt. If it already knows the
            prompt definition, it can go straight to <Mono>prompts/get</Mono>.
          </p>
        </div>
      </section>

      {/* 5. Trip comes together */}
      <section className="space-y-4 border-l-4 border-amber-500 pl-5">
        <h2 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
          5. How the Barcelona trip comes together
        </h2>
        <ol className="space-y-3">
          {tripSteps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="bg-amber-500 text-white h-7 w-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{step.title}.</strong> {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Extra details */}
      <section className="space-y-5 border-l-4 border-rose-500 pl-5">
        <h2 className="text-2xl font-bold text-rose-700 dark:text-rose-300">Extra details</h2>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Suggest values while you type</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            With <Mono>completion/complete</Mono>, an app can ask a server that supports completions for suggestions.
            For example, typing <strong>Bar</strong> into a destination field could bring up Barcelona.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Watch a resource for changes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If the server advertises <Mono>{'"subscribe": true'}</Mono> for resources, the app can use{" "}
            <Mono>subscriptions/listen</Mono>. The <Mono>resourceSubscriptions</Mono> filter lists the URIs to watch.
            The app keeps the stream open so it can receive updates without asking again each time.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you add a meeting to your June calendar, the server can send{" "}
            <Mono>notifications/resources/updated</Mono>. The app can then use <Mono>resources/read</Mono> to fetch
            the latest availability.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Read a few fields in a protocol message</h3>
          <Table
            head={["Field", "What it tells the app or server"]}
            rows={[
              [
                <Mono key="f">id</Mono>,
                <>
                  Which request a response belongs to. If the app sends <Mono>{'"id": 1'}</Mono>, the response uses{" "}
                  <Mono>{'"id": 1'}</Mono> too.
                </>,
              ],
              [
                <Mono key="f">_meta</Mono>,
                "Extra details. In the request examples, it carries information such as the protocol version and client capabilities.",
              ],
              [
                <Mono key="f">{'resultType: "complete"'}</Mono>,
                "The server has finished that request. In the flight example, the search has completed.",
              ],
            ]}
          />
        </div>
      </section>

      {/* Quick check */}
      <section className="bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>✅</span> Quick check
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">The app wants to know which tools are available. Which request does it send?</p>
            <p className="text-sm text-muted-foreground mt-1">
              <Mono>tools/list</Mono>
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">
              The app wants actual flights from New York to Barcelona. Which request does it send?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <Mono>tools/call</Mono>, with <Mono>searchFlights</Mono> as the tool name.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
