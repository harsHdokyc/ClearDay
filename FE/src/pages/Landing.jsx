import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, CheckCircle, Brain, Sparkles, TrendingUp, Clock, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(ref => {
      if (ref) {
        ref.classList.add('opacity-0');
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] overflow-x-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex items-center justify-center px-6 lg:px-12 relative"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#E8E5FF] rounded-full blur-3xl opacity-30 animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFE5F0] rounded-full blur-3xl opacity-20 animate-pulse-slow [animation-delay:1s]" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mt-16 lg:mt-24 mb-8 border border-[#E8E5FF]/50 opacity-0 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#8B7FD9]" />
            <span className="text-sm font-medium text-[#5A4F7C] font-grotesk">Build habits that stick</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold leading-[1.1] mb-8 opacity-0 animate-fade-in [animation-delay:100ms]">
            <span className="font-serif-display text-[#2D1B3D] italic">Good skin</span>
            <br />
            <span className="font-grotesk text-[#5A4F7C]">isn't about motivation.</span>
            <br />
            <span className="font-sans text-[#8B7FD9] text-5xl lg:text-7xl font-semibold mt-2 block">
              It's about showing up.
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-[#6B5F7F] mb-12 leading-relaxed max-w-3xl mx-auto font-light opacity-0 animate-fade-in [animation-delay:200ms]">
            ClearDay helps you build consistency through daily check-ins, routine confirmation, and AI-powered insights that understand what's actually working for your skin.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in [animation-delay:300ms]">
            <button 
              onClick={() => navigate('/sign-in')}
              className="group inline-flex items-center gap-3 bg-[#2D1B3D] text-white px-10 py-5 rounded-lg text-lg font-medium hover:bg-[#3D2B4D] transition-all duration-300 hover:scale-105 hover:shadow-lg font-grotesk"
            >
              Start your ClearDay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#6B5F7F] hover:text-[#2D1B3D] transition-colors font-medium"
            >
              Learn more →
            </button>
          </div>

          {/* Visual Element */}
          <div className="mt-20 relative opacity-0 animate-fade-in [animation-delay:400ms]">
            <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] bg-gradient-to-br from-[#F5F3FF] to-[#FFF5F9] rounded-2xl border border-[#E8E5FF]/50 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 p-8 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8E5FF]/30 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                      <Camera className="w-8 h-8 text-[#8B7FD9] opacity-50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section 
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 relative"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-8 mb-20">
            <div className="flex-shrink-0">
              <div className="w-1 h-24 bg-[#8B7FD9] rounded-full" />
            </div>
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-[#2D1B3D] mb-6 font-serif-display italic">
                The quiet problem
              </h2>
              <p className="text-xl text-[#6B5F7F] leading-relaxed max-w-2xl font-light">
                We've all been there. The excitement of a new routine, the promise of better skin. Then life happens.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                title: "Starting strong, quitting early",
                description: "One missed day becomes two, then a week. The motivation fades, and the products sit on the shelf.",
                icon: Clock,
                color: "text-[#8B7FD9]"
              },
              {
                title: "Doubting whether products work",
                description: "Without consistent tracking, it's impossible to know if that expensive serum is actually helping. You're left guessing.",
                icon: TrendingUp,
                color: "text-[#FF9BB5]"
              },
              {
                title: "Losing trust in routines",
                description: "When you can't see progress, you stop believing in the process. The cycle becomes exhausting.",
                icon: Shield,
                color: "text-[#A8D5BA]"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-[#E8E5FF]/30 hover:border-[#8B7FD9]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-[#E8E5FF]/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2D1B3D] mb-3 font-grotesk">
                    {item.title}
                  </h3>
                  <p className="text-[#6B5F7F] leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The Insight Section */}
      <section 
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 bg-white/40 relative"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold text-[#2D1B3D] mb-8 font-serif-display italic">
                Why ClearDay exists
              </h2>
              <p className="text-2xl text-[#5A4F7C] leading-relaxed mb-6 font-light">
                Consistency is invisible. ClearDay makes it visible.
              </p>
              <p className="text-lg text-[#6B5F7F] leading-relaxed mb-6 font-light">
                The insight that drives ClearDay is simple: you can't improve what you don't measure. But skincare tracking shouldn't feel like a chore or another source of anxiety.
              </p>
              <p className="text-lg text-[#6B5F7F] leading-relaxed font-light">
                By capturing daily photos and confirming your routine, ClearDay builds a dataset that's uniquely yours. Over time, patterns emerge. You start to understand what's actually working, not just what you hope is working.
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Camera, label: "Daily photos", desc: "Visual proof" },
                  { icon: CheckCircle, label: "Routine confirmation", desc: "Build consistency" },
                  { icon: Brain, label: "AI-powered context", desc: "Understand patterns" },
                  { icon: Sparkles, label: "Real insights", desc: "Data-driven" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      className="aspect-square bg-[#F5F3FF] rounded-2xl border border-[#E8E5FF]/50 p-6 flex flex-col items-center justify-center hover:bg-[#E8E5FF]/30 transition-all duration-300 hover:scale-105"
                    >
                      <Icon className="w-8 h-8 text-[#8B7FD9] mb-3" />
                      <span className="text-sm font-semibold text-[#2D1B3D] text-center font-grotesk">{item.label}</span>
                      <span className="text-xs text-[#6B5F7F] mt-1">{item.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        id="how-it-works"
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 relative"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-bold text-[#2D1B3D] mb-20 text-center font-serif-display italic">
            How it works
          </h2>
          
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Check in once a day",
                description: "Take a quick photo and confirm your routine. Less than two minutes total. Consistency over perfection."
              },
              {
                step: "02",
                title: "See progress over time",
                description: "Your daily check-ins build a visual timeline of your skin's journey. Watch patterns emerge naturally."
              },
              {
                step: "03",
                title: "Understand what's working",
                description: "AI analyzes your patterns to provide insights about your routine's effectiveness. No guessing, just clarity."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="flex gap-8 items-start group"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-[#E8E5FF]/30 rounded-2xl flex items-center justify-center group-hover:bg-[#8B7FD9] group-hover:text-white transition-all duration-300">
                    <span className="text-2xl font-bold text-[#8B7FD9] group-hover:text-white font-grotesk">
                      {item.step}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold text-[#2D1B3D] mb-3 font-grotesk">
                    {item.title}
                  </h3>
                  <p className="text-lg text-[#6B5F7F] leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section 
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 bg-white/40 relative"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-[#2D1B3D] mb-6 font-serif-display italic">
              AI, without the AI hype
            </h2>
            <p className="text-2xl text-[#5A4F7C] leading-relaxed max-w-3xl mx-auto font-light">
              ClearDay doesn't tell you what to do.
              <br />
              It helps you understand what's happening.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E8E5FF]/50 p-12 lg:p-16">
            <p className="text-lg text-[#6B5F7F] leading-relaxed mb-8 font-light">
              Our AI approach is observational, not prescriptive. It analyzes your photos and routine data to identify patterns, correlations, and changes that might be difficult to spot with the naked eye.
            </p>
            <p className="text-lg text-[#6B5F7F] leading-relaxed font-light">
              Think of it as having a dermatologist's eye for detail, but focused entirely on your unique skin journey. No guarantees, no instant results—just honest analysis of your data.
            </p>
            
            <div className="mt-12 pt-8 border-t border-[#E8E5FF]/50">
              <p className="text-lg text-[#5A4F7C] italic leading-relaxed font-light">
                "The AI in ClearDay is like having a research assistant for your skin. It observes, analyzes, and reports back with insights you can actually use to make better decisions."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section 
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 relative"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-bold text-[#2D1B3D] mb-20 text-center font-serif-display italic">
            Who it's for
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                title: "Someone starting",
                description: "You're new to skincare and want to build habits that last. You need structure, not overwhelm. ClearDay helps you establish a foundation you can trust.",
                accent: "bg-[#FFE5F0]"
              },
              {
                title: "Someone serious",
                description: "You've been doing this for a while but want to optimize. You're ready to move beyond guessing and start making data-informed decisions about your routine.",
                accent: "bg-[#E5F5FF]"
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`p-10 rounded-3xl ${item.accent} border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <h3 className="text-3xl font-semibold text-[#2D1B3D] mb-4 font-grotesk">
                  {item.title}
                </h3>
                <p className="text-lg text-[#5A4F7C] leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section 
        ref={addToRefs}
        className="py-32 px-6 lg:px-12 bg-[#2D1B3D] relative overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7FD9]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF9BB5]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight font-serif-display italic">
            Start tracking.
            <br />
            <span className="font-grotesk text-4xl lg:text-6xl font-semibold">Let the data speak.</span>
          </h2>
          <p className="text-xl text-white/80 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
            Join thousands building better skin habits, one day at a time.
          </p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="group inline-flex items-center gap-3 bg-white text-[#2D1B3D] px-10 py-5 rounded-lg text-lg font-medium hover:bg-[#FAF9F7] transition-all duration-300 hover:scale-105 hover:shadow-xl font-grotesk"
          >
            Start your ClearDay
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default Landing;
