import { useNavigate } from "react-router-dom";
import {
  Brain,
  Zap,
  Trophy,
  Users,
  BarChart3,
  Play,
  ArrowRight,
  Menu,
  X,
  Mail,
  Twitter,
  Github,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <Brain size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">QuizMaster</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#features" className="hover:text-slate-900 transition">
              Features
            </a>
            <a href="#how" className="hover:text-slate-900 transition">
              How it Works
            </a>
            <button
              onClick={() => navigate("/login")}
              className="hover:text-slate-900 transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-6 py-6 flex flex-col gap-6 text-lg font-medium">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#how" onClick={() => setMobileMenuOpen(false)}>
                How it Works
              </a>
              <button onClick={() => navigate("/login")}>Log in</button>
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
            Interactive Quizzes <br />
            Made Simple
          </h1>

          <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Create AI-powered quizzes, host live games, and track results — all
            in one clean, minimalist platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
            >
              Start for Free <ArrowRight size={20} />
            </button>
            <button
              onClick={() => navigate("/join")}
              className="px-8 py-4 border-2 border-slate-200 rounded-xl font-semibold text-lg hover:border-slate-300 transition flex items-center justify-center gap-2"
            >
              <Play size={20} /> Join a Quiz
            </button>
          </div>

          <div className="text-slate-500">
            Trusted by teachers, teams, and trivia hosts worldwide
          </div>
        </div>
      </header>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Key Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            <Feature
              title="AI Quiz Generation"
              desc="Instantly generate complete quizzes from any topic."
            />
            <Feature
              title="Live Leaderboards"
              desc="Real-time rankings that keep players engaged."
            />
            <Feature
              title="Unlimited Players"
              desc="Host events for any size audience seamlessly."
            />
            <Feature
              title="Detailed Analytics"
              desc="Clear insights into performance and results."
            />
            <Feature
              title="Customizable"
              desc="Full control over questions and branding."
            />
            <Feature
              title="Instant Play"
              desc="Share a code and start in seconds."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">How it Works</h2>

          <div className="grid md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
            <Step number="1" title="Create">
              Generate with AI or build manually
            </Step>
            <Step number="2" title="Host">
              Share a code and launch live
            </Step>
            <Step number="3" title="Engage">
              Compete, learn, and review results
            </Step>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            Ready to get started?
          </h2>
          <p className="text-xl lg:text-2xl text-slate-300 mb-12">
            No credit card required. Free forever for basic use.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-bold text-xl hover:bg-slate-100 transition shadow-lg"
          >
            Create Your First Quiz
          </button>
        </div>
      </section>

      {/* --- IMPROVED FOOTER --- */}
      <footer className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <Brain size={24} />
                </div>
                <span className="text-xl font-bold">QuizMaster</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                The simple, powerful platform for creating and hosting
                interactive quizzes.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition"
                >
                  <Github size={20} />
                </a>
                <a
                  href="#"
                  className="text-slate-500 hover:text-slate-900 transition"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <a
                    href="#features"
                    className="hover:text-slate-900 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-slate-900 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} QuizMaster. All rights reserved.</p>
            <p>Made with care for educators and teams worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components (unchanged)
function Feature({ title, desc }) {
  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div>
      <div className="w-16 h-16 mx-auto mb-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold">
        {number}
      </div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600">{children}</p>
    </div>
  );
}
