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
      <div className="glass-card p-8 md:p-10 rounded-3xl border-border/80 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-[#6C63FF] text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Project Team</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3D4852] tracking-tight">
          Meet the Developers
        </h1>
        <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-2xl">
          The team behind TrendSkope.
        </p>
      </div>

      {/* 2. Team Members Grid (9 Members) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-bold text-[#3D4852]">Project Contributors</h2>
          </div>
          <span className="text-xs font-mono font-bold text-[#6B7280] bg-[#E0E5EC] px-3 py-1 rounded-xl shadow-[inset_4px_4px_8px_rgb(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]">
            9 Members
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="flex items-center gap-4 p-5 rounded-[28px] bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] transition-all hover:translate-y-[-2px]"
            >
              {/* Avatar Portrait */}
              <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] bg-[#E0E5EC] flex items-center justify-center">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={160}
                    height={160}
                    className={`w-full h-full object-cover ${member.focus || ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#6C63FF] font-black text-lg bg-primary-orange/5">
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
                <h3 className="text-sm font-extrabold text-[#3D4852] truncate">
                  {member.name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#6C63FF] px-2 py-0.5 rounded-lg bg-[#E0E5EC] shadow-[inset_3px_3px_6px_rgb(163,177,198,0.5),inset_-3px_-3px_6px_rgba(255,255,255,0.5)]">
                    {member.id}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] font-medium">
                  {member.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Technology Stack Section */}
      <section className="glass-card p-6 md:p-8 rounded-3xl border-border/80 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-transparent">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-bold text-[#3D4852]">Technology Stack</h2>
          </div>
          <span className="text-xs text-[#6B7280] font-medium">
            Production & ML Infrastructure
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-4 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] space-y-1"
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm font-bold text-[#3D4852]">
                  {tech.name}
                </strong>
                <Code className="w-3.5 h-3.5 text-[#6C63FF]" />
              </div>
              <span className="text-[11px] text-[#6B7280] block font-medium">
                {tech.category}
              </span>
              <span className="text-[10px] font-mono text-[#6C63FF] block">
                {tech.version}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Team Statement */}
      <section className="p-6 rounded-3xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border border-transparent flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-[#E0E5EC] text-[#6C63FF] shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm text-[#6B7280] leading-relaxed">
          <strong className="text-[#3D4852] block font-bold text-sm">
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
