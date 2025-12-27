import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Brain,
  Trophy,
  Zap,
  Users,
  ArrowRight,
  Play,
  Check,
  Star,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Brain size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Quiz<span className="text-indigo-600">Master</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition">
              Features
            </a>
            <a href="#demo" className="hover:text-indigo-600 transition">
              Live Demo
            </a>
            <a href="#reviews" className="hover:text-indigo-600 transition">
              Reviews
            </a>
            <div className="h-6 w-px bg-slate-200"></div>
            <button
              onClick={() => navigate("/login")}
              className="text-slate-900 hover:text-indigo-600 transition font-semibold"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[800px] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-bold mb-8 shadow-sm animate-fade-in-up">
                <Sparkles size={16} className="fill-indigo-600" />
                <span>Now with AI-Powered Generation</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                The Smartest Way to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                  Gamify Learning
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Create engaging quizzes in seconds, host live sessions, and
                track performance with real-time analytics. Perfect for
                classrooms, teams, and trivia nights.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  Start Creating <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate("/join")}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play size={20} fill="currentColor" /> Join a Game
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=64&h=64"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64"
                    className="w-8 h-8 rounded-full border-2 border-white"
                    alt="User"
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-bold">
                    +2k
                  </div>
                </div>
                <p>Loved by 2,000+ quiz hosts</p>
              </div>
            </div>

            {/* Hero Image / Mockup */}
            <div className="lg:w-1/2 relative perspective-1000">
              {/* Main Card */}
              <div className="relative z-20 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 transform rotate-y-12 hover:rotate-0 transition-all duration-700 ease-out">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1740&auto=format&fit=crop"
                  alt="Dashboard Preview"
                  className="rounded-2xl w-full object-cover h-[400px]"
                />

                {/* Floating Badge 1 */}
                <div className="absolute -left-8 top-12 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow border border-slate-100 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <Trophy size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">
                        Current Rank
                      </p>
                      <p className="font-bold text-slate-800 text-lg">
                        1st Place
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -right-8 bottom-12 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow delay-700 border border-slate-100 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <Zap size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">
                        Streak
                      </p>
                      <p className="font-bold text-slate-800 text-lg">
                        5 in a row!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decor Elements */}
              <div className="absolute top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </header>

      {/* --- STATS STRIP --- */}
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem number="10k+" label="Active Users" />
          <StatItem number="50k+" label="Quizzes Created" />
          <StatItem number="1M+" label="Questions Answered" />
          <StatItem number="4.9/5" label="Average Rating" />
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">
              Features
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-3 mb-6">
              Everything you need to engage
            </h2>
            <p className="text-xl text-slate-500">
              Whether you are testing students or hosting a game night, we have
              the tools to make it seamless and fun.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Zap className="text-white" />}
              iconBg="bg-orange-500"
              title="Instant AI Generation"
              desc="Writer's block? Just type a topic like 'Roman History' and watch our AI generate questions, options, and correct answers in seconds."
              img="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop"
            />
            <FeatureCard
              icon={<Trophy className="text-white" />}
              iconBg="bg-indigo-600"
              title="Live Leaderboards"
              desc="Create excitement with real-time score tracking. Watch ranks shift dynamically as players answer questions."
              img="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
            />
            <FeatureCard
              icon={<Users className="text-white" />}
              iconBg="bg-pink-500"
              title="Massive Multiplayer"
              desc="Host hundreds of players simultaneously with our robust, low-latency infrastructure. Perfect for large events."
              img="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2532&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Visual) --- */}
      <section id="how-it-works" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[3rem] rotate-6 opacity-20 transform scale-95"></div>
              <img
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2370&auto=format&fit=crop"
                alt="How it works"
                className="relative rounded-[2.5rem] shadow-2xl z-10 w-full object-cover h-[600px]"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-12">
                From Idea to Game in Minutes
              </h2>

              <div className="space-y-10">
                <StepItem
                  number="01"
                  title="Create or Generate"
                  desc="Build questions manually or use our AI wizard to generate a quiz from any topic text."
                />
                <StepItem
                  number="02"
                  title="Host Live Session"
                  desc="Launch a lobby, share the unique 6-digit code, and wait for your players to join."
                />
                <StepItem
                  number="03"
                  title="Analyze Results"
                  desc="Get detailed insights into performance, tough questions, and individual player stats."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 opacity-20 rounded-full -ml-20 -mb-20 blur-3xl"></div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10 tracking-tight">
              Ready to host your first quiz?
            </h2>
            <p className="text-indigo-100 text-xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">
              Join thousands of educators and team leads who are making learning
              fun, interactive, and data-driven today.
            </p>
            <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-indigo-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-xl transform hover:-translate-y-1"
              >
                Sign Up Now - It's Free
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <Brain size={18} />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  Quiz<span className="text-indigo-600">Master</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Making learning interactive and fun for everyone, everywhere.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    AI Generator
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-indigo-600 transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              © {new Date().getFullYear()} QuizMaster Inc. All rights reserved.
            </div>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition cursor-pointer"></div>
              <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition cursor-pointer"></div>
              <div className="w-8 h-8 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition cursor-pointer"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components ---

function StatItem({ number, label }) {
  return (
    <div>
      <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
        {number}
      </div>
      <div className="text-indigo-200 font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, desc, img }) {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <div className="h-48 overflow-hidden">
        <img
          src={img}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-8">
        <div
          className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({ number, title, desc }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold bg-indigo-50">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
