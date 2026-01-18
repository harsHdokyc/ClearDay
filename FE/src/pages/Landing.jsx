import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, BarChart3, Eye, Camera, CheckCircle, Brain, Users, Target } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-8">
            Good skin isn't about motivation.
            <br />
            <span className="text-slate-700">It's about showing up.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            ClearDay helps you build consistency through daily check-ins, routine confirmation, and AI-powered insights that understand what's actually working for your skin.
          </p>
          <button 
            onClick={() => navigate('/sign-in')}
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-none text-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Start your ClearDay
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">The quiet problem</h2>
          
          <div className="space-y-12">
            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Starting strong, quitting early</h3>
              <p className="text-slate-600 leading-relaxed">
                We've all been there. The excitement of a new routine, the promise of better skin. Then life happens. One missed day becomes two, then a week. The motivation fades, and the products sit on the shelf.
              </p>
            </div>

            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Doubting whether products work</h3>
              <p className="text-slate-600 leading-relaxed">
                Without consistent tracking, it's impossible to know if that expensive serum is actually helping. You're left guessing, influenced by marketing claims rather than real data about your own skin.
              </p>
            </div>

            <div className="max-w-2xl">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Losing trust in routines</h3>
              <p className="text-slate-600 leading-relaxed">
                When you can't see progress, you stop believing in the process. The cycle of starting and stopping becomes exhausting, and your skin goals feel further away than ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Insight Section */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">Why ClearDay exists</h2>
          
          <div className="space-y-8">
            <div className="max-w-3xl">
              <p className="text-xl text-slate-700 leading-relaxed mb-8">
                Consistency is invisible. ClearDay makes it visible.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                The insight that drives ClearDay is simple: you can't improve what you don't measure. But skincare tracking shouldn't feel like a chore or another source of anxiety.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By capturing daily photos and confirming your routine, ClearDay builds a dataset that's uniquely yours. Over time, patterns emerge. You start to understand what's actually working, not just what you hope is working.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <Camera className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Daily photos</h3>
                <p className="text-slate-600 text-sm">Visual proof of your journey</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Routine confirmation</h3>
                <p className="text-slate-600 text-sm">Build consistency through accountability</p>
              </div>
              <div className="text-center">
                <Brain className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">AI-powered context</h3>
                <p className="text-slate-600 text-sm">Understand patterns you might miss</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">How it works</h2>
          
          <div className="space-y-12">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Check in once a day</h3>
                <p className="text-slate-600 leading-relaxed">
                  Take a quick photo and confirm your routine. Less than two minutes total.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">See progress over time</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your daily check-ins build a visual timeline of your skin's journey.
                </p>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Understand what's working</h3>
                <p className="text-slate-600 leading-relaxed">
                  AI analyzes your patterns to provide insights about your routine's effectiveness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">AI, without the AI hype</h2>
          
          <div className="space-y-8">
            <div className="max-w-3xl">
              <p className="text-xl text-slate-700 leading-relaxed mb-8">
                ClearDay doesn't tell you what to do.
                <br />
                It helps you understand what's happening.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our AI approach is observational, not prescriptive. It analyzes your photos and routine data to identify patterns, correlations, and changes that might be difficult to spot with the naked eye.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Think of it as having a dermatologist's eye for detail, but focused entirely on your unique skin journey. No guarantees, no instant results—just honest analysis of your data.
              </p>
            </div>

            <div className="border-l-4 border-slate-300 pl-8 mt-12">
              <p className="text-slate-600 italic">
                "The AI in ClearDay is like having a research assistant for your skin. It observes, analyzes, and reports back with insights you can actually use to make better decisions."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">Who it's for</h2>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Someone starting</h3>
              <p className="text-slate-600 leading-relaxed">
                You're new to skincare and want to build habits that last. You need structure, not overwhelm. ClearDay helps you establish a foundation you can trust.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Someone serious</h3>
              <p className="text-slate-600 leading-relaxed">
                You've been doing this for a while but want to optimize. You're ready to move beyond guessing and start making data-informed decisions about your routine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
            Start tracking.
            <br />
            Let the data speak.
          </h2>
          <button 
            onClick={() => navigate('/sign-in')}
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-none text-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Start your ClearDay
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
