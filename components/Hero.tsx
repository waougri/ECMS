import React from "react";
import { BUSINESS_INFO } from "../constants";

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center bg-white overflow-hidden pt-20">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f4f7f2] -skew-x-6 transform translate-x-20 hidden lg:block"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-on-load">

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[#114f20] leading-[1.1] mb-8">
              Sparkling Clean <br />
              Office Spaces.
            </h1>

            <p className="relative text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
              {/* subtle vertical accent */}
              <span className="absolute -left-6 top-2 h-16 w-[2px] bg-gradient-to-b from-emerald-500/60 to-transparent hidden md:block" />
              <span className="font-semibold text-emerald-600">Since {BUSINESS_INFO.since}</span>,
              we've been the{" "}
              <span className="font-semibold text-slate-800">
                trusted partner
              </span>{" "}
              for{" "}
              <span className="font-semibold text-slate-800">
                Wilmington businesses
              </span>
              , not as a faceless corporation, but as{" "}
              <span className="font-semibold text-slate-800">neighbors</span>{" "}
              who take pride in every job.
              <br />
              <br />
              <span className="inline-flex items-start gap-2 text-slate-700">
                {/* small premium check icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  Specializing in{" "}
                  <span className="font-medium text-slate-800">
                    commercial office cleaning
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-slate-800">
                    facility support
                  </span>
                  , delivering{" "}
                  <span className="font-semibold text-emerald-600">
                    consistency, care, and peace of mind
                  </span>
                  .
                </span>
              </span>
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="bg-[#114f20] text-white px-10 py-5 rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg text-center uppercase tracking-wider text-sm"
              >
                Get a Comparison Quote
              </a>
              <a
                href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, "")}`}
                className="bg-white text-[#114f20] border-2 border-[#114f20] px-10 py-5 rounded-xl font-bold hover:bg-[#f4f7f2] transition-all text-center uppercase tracking-wider text-sm"
              >
                {BUSINESS_INFO.phone}
              </a>
            </div>
          </div>

          <div
            className="hidden lg:block relative animate-on-load"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://www.southernliving.com/thmb/Twr3p5wRqgEN5tZO3MhJC3EfEZw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/27529_WilmiWilmington_NC-Riverwalk-6017-cfc0ba2f5f80487fa0f30caca55b9b06.jpg"
                className="w-full h-auto object-cover aspect-[4/3]"
                alt="Clean Commercial Office"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-[#8a9a5b] p-8 rounded-2xl shadow-xl text-white">
              <p className="text-4xl font-serif font-bold">50+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">
                Years Serving Wilmington
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
