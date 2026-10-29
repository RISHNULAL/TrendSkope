"use client";

import React from "react";
import Image from "next/image";
import { Users, Code, Cpu, Sparkles } from "lucide-react";

interface TeamMember {
  name: string;
  id: string;
  role: string;
  image?: string;
  focus?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "RISHNU LAL N",
    id: "VDA24CS047",
    role: "Team Member",
    image: "/assets/team/rishnu.jpg",
  },
  {
    name: "THAMMANNA PARVEEN K",
    id: "VDA24CS006",
    role: "Team Member",
    image: "/assets/team/thamanna.jpg",
  },
  {
    name: "AMRUTHESH V K",
    id: "VDA24CS010",
    role: "Team Member",
    image: "/assets/team/amruthesh.jpg",
  },
  {
    name: "FATHIMA HIBA C",
    id: "VDA24CS020",
    role: "Team Member",
    image: "/assets/team/fathima-hiba-c.jpg",
  },
  {
    name: "SREENANDA S",
    id: "VDA24CS064",
    role: "Team Member",
    image: "/assets/team/sreenanda-s.jpg",
  },
  {
    name: "MUHAMMED ASWLAH MV",
    id: "VDA24CS037",
    role: "Team Member",
    image: "/assets/team/muhammed-aswlah-mv.jpg",
  },
  {
    name: "AMAN MAHESHWAR N",
    id: "VDA24CS008",
    role: "Team Member",
    image: "/assets/team/aman.jpg",
  },
  {
    name: "LIYA FATHIMA N",
    id: "VDA24CS031",
    role: "Team Member",
    image: "/assets/team/liya-fathima-n.jpg",
  },
  {
    name: "NIDHIN JOSE",
    id: "VDA24CS040",
    role: "Team Member",
    image: "/assets/team/nidhin.jpg",
    focus: "object-[center_18%]",
  },
];

const techStack = [
  { name: "Next.js", category: "Frontend Framework", version: "App Router" },
  { name: "TypeScript", category: "Type-Safe Core", version: "ESNext" },
  { name: "Python", category: "Backend & ML Engine", version: "3.11" },
  { name: "FastAPI", category: "REST API Service", version: "Asynchronous" },
  { name: "scikit-learn", category: "Machine Learning Pipeline", version: "Regression & Scaling" },
  { name: "Pandas", category: "Data Manipulation", version: "Time-Series Cleaning" },
  { name: "NumPy", category: "Numerical Computation", version: "Matrix & Normalization" },
  { name: "Tailwind CSS", category: "Neumorphic Design System", version: "Custom Tokens" },
];

export default function DevelopersView() {
  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-8">
      {/* 1. Header Banner */}
      <div className="glass-card p-8 md:p-10 rounded-2xl border border-[#E7E3F0] bg-white shadow-card space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EBFF] border border-[#6C4DFF]/20 text-[#6C4DFF] text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Project Team</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#242137] tracking-tight">
          Meet the Developers
        </h1>
        <p className="text-sm sm:text-base text-[#68677D] leading-relaxed max-w-2xl">
          The team behind TrendSkope.
        </p>
      </div>

      {/* 2. Team Members Grid (9 Members) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C4DFF]" />
            <h2 className="text-lg font-bold text-[#242137]">Project Contributors</h2>
          </div>
          <span className="text-xs font-mono font-bold text-[#6C4DFF] bg-[#F0EBFF] border border-[#6C4DFF]/20 px-3 py-1 rounded-xl">
            9 Members
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#E7E3F0] shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              {/* Avatar Portrait */}
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-[#E7E3F0] bg-[#F8F7FC] shadow-sm flex items-center justify-center">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={160}
                    height={160}
                    className={`w-full h-full object-cover ${member.focus || ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#6C4DFF] font-black text-lg bg-[#F0EBFF]">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-sm font-extrabold text-[#242137] truncate">
                  {member.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#6C4DFF] px-2 py-0.5 rounded-lg bg-[#F0EBFF] border border-[#6C4DFF]/20">
                    {member.id}
                  </span>
                </div>
                <p className="text-[11px] text-[#68677D] font-medium">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Technology Stack Section */}
      <section className="glass-card p-6 md:p-8 rounded-2xl border border-[#E7E3F0] bg-white shadow-card space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E3F0]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6C4DFF]" />
            <h2 className="text-lg font-bold text-[#242137]">Technology Stack</h2>
          </div>
          <span className="text-xs text-[#68677D] font-medium">
            Production & ML Infrastructure
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-xl bg-[#F8F7FC] border border-[#E7E3F0] space-y-1 hover:border-[#6C4DFF]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-[#242137]">
                  {tech.name}
                </strong>
                <Code className="w-3.5 h-3.5 text-[#6C4DFF]" />
              </div>
              <span className="text-[11px] text-[#68677D] block font-medium">
                {tech.category}
              </span>
              <span className="text-[10px] font-mono text-[#6C4DFF] block">
                {tech.version}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Team Statement */}
      <section className="p-6 rounded-2xl bg-white border border-[#E7E3F0] shadow-card flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-[#F0EBFF] text-[#6C4DFF] border border-[#6C4DFF]/20 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-[#68677D] leading-relaxed">
          <strong className="text-[#242137] block font-bold text-sm">
            Academic Collaborative Statement
          </strong>
          <p>
            Built as a collaborative academic project focused on applying machine learning to practical social-media analytics.
          </p>
        </div>
      </section>
    </div>
  );
}
