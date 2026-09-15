import { Activity, Shield, Zap, Terminal, ArrowRight, Server, Code } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight">BackendBhai</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium">Features</a>
          <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium">How it works</a>
          <a href="https://github.com/Abhi-R459/BackendBhai" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
            <Code className="w-5 h-5" /> GitHub
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-8 text-slate-900">
            Chrome DevTools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">backend systems</span>.
          </h1>
          <p className="text-xl text-slate-600 mb-12 leading-relaxed">
            A local-first observability platform. Capture every request that flows through your backend and view it as one interactive execution story — service hops, database queries, and external APIs — in a single browser tab.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="https://github.com/Abhi-R459/BackendBhai" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-lg">
              <Terminal className="w-5 h-5" />
              Quick Start
            </a>
            <a href="#how-it-works" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-colors text-lg">
              Learn more
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Why BackendBhai?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Local-First & Private</h3>
              <p className="text-slate-600">Everything runs on your machine. No cloud, no SaaS, no accounts. Your telemetry data never leaves your laptop.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Zero Fabricated Data</h3>
              <p className="text-slate-600">The graph is discovered, not declared. Services, dependencies, and node types are derived directly from actual trace data.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">OpenTelemetry Native</h3>
              <p className="text-slate-600">Works with any language or framework. Just point your standard OpenTelemetry SDK exporter to our local collector.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Instrument Your Code</h4>
                  <p className="text-slate-600">Add OpenTelemetry auto-instrumentation to your Node.js, Python, Java, or Go project. No proprietary SDKs needed.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Send Telemetry</h4>
                  <p className="text-slate-600">Point your app's OTLP exporter to the BackendBhai collector running on `localhost:4318`.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Visualize Execution</h4>
                  <p className="text-slate-600">Open `localhost:4001` in your browser. Watch as the platform automatically reverse-engineers your APIs and draws the topology graph.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-8 text-slate-300 font-mono text-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Code className="text-emerald-400 w-5 h-5" />
                  <span>export OTEL_SERVICE_NAME="my-api"</span>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="text-blue-400 w-5 h-5" />
                  <span>export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Terminal className="text-slate-400 w-5 h-5" />
                  <span className="text-slate-400"># Start your application</span>
                </div>
                <div className="flex items-center gap-3">
                  <Terminal className="text-indigo-400 w-5 h-5" />
                  <span>node --require ./telemetry.js index.js</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 text-white py-20 text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to see your backend clearly?</h2>
          <p className="text-indigo-100 mb-10 text-lg">Stop guessing where the latency is coming from. Start tracing locally in minutes.</p>
          <a href="https://github.com/Abhi-R459/BackendBhai" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg text-lg">
            View on GitHub
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-6 h-6" />
            <span className="font-bold tracking-tight">BackendBhai</span>
          </div>
          <p>© {new Date().getFullYear()} BackendBhai. Open Source observability.</p>
          <div className="flex gap-4">
            <a href="https://github.com/Abhi-R459/BackendBhai" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Code className="w-6 h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
