"use client";

import React, { useState } from "react";
import {
  Building,
  GraduationCap,
  Users,
  ChevronDown,
  ChevronRight,
  Award,
  Sparkles,
  Filter,
  CheckCircle2
} from "lucide-react";

export interface DepartmentHierarchy {
  id: number;
  name: string;
  code: string;
  head: string;
  head_fte: number;
  teachers_count: number;
  avg_score: number;
}

export interface FacultyHierarchy {
  id: number;
  name: string;
  code: string;
  dean: string;
  dean_fte: number;
  departments: DepartmentHierarchy[];
}

export interface StructureHierarchy {
  branch_name: string;
  total_faculties: number;
  total_departments: number;
  total_teachers_hemis: number;
  faculties: FacultyHierarchy[];
}

interface StructureViewProps {
  theme: "light" | "dark";
  userRole: "ADMIN" | "DEAN" | "HEAD_OF_DEPT" | "TEACHER" | "RECTORATE";
  userFaculty?: string;
  userDepartment?: string;
  hierarchyData: StructureHierarchy | null;
  onSelectDepartment?: (deptName: string) => void;
}

export default function StructureHierarchyView({
  theme,
  userRole,
  userFaculty,
  userDepartment,
  hierarchyData,
  onSelectDepartment
}: StructureViewProps) {
  const [expandedFaculties, setExpandedFaculties] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true
  });
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  const toggleFaculty = (id: number) => {
    setExpandedFaculties(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faculties = hierarchyData?.faculties || [];

  // Filter faculties based on user role
  const visibleFaculties = faculties.filter(f => {
    if (userRole === "DEAN" && userFaculty) {
      return f.name.toLowerCase().includes(userFaculty.toLowerCase()) ||
             userFaculty.toLowerCase().includes(f.name.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Branch Header Overview Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        theme === "dark"
          ? "bg-slate-900/90 border-slate-800 shadow-xl"
          : "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg"
      }`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
              <Building className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  Tashkiliy ierarxiya
                </span>
                <span className="text-xs text-blue-200/80">Filial — Fakultet — Kafedra</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1 text-white">
                {hierarchyData?.branch_name || "Oʻzbekiston Milliy universiteti Jizzax filiali"}
              </h2>
              <p className="text-xs text-blue-200/80 mt-1">
                Kafedralar va fakultetlar faoliyatining meʼzonlar boʻyicha integratsiyalashgan daraxtsimon tuzilmasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-white">{hierarchyData?.total_faculties || 3}</div>
              <div className="text-[10px] text-blue-200 font-semibold uppercase">Fakultet</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-white">{hierarchyData?.total_departments || 9}</div>
              <div className="text-[10px] text-blue-200 font-semibold uppercase">Kafedra</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xl font-black text-white">{hierarchyData?.total_teachers_hemis || 199}</div>
              <div className="text-[10px] text-blue-200 font-semibold uppercase">HEMIS oʻqituvchi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Navigation Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-blue-50 border-blue-200 text-blue-900"
      }`}>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Sizning tizimdagi birikmangiz:</span>
          <span className="font-bold underline">
            {userRole === "DEAN"
              ? `Fakultet Dekani (${userFaculty || "Psixologiya fakulteti"})`
              : userRole === "HEAD_OF_DEPT"
              ? `Kafedra Mudiri (${userDepartment || "Amaliy matematika"})`
              : userRole === "RECTORATE"
              ? "Filial Rahbariyati (Barcha 3 ta fakultet va 9 ta kafedra)"
              : "Administrator boshqaruvi"}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Kafedra ustiga bosib, uning aʼzolari va KPI tahlilini koʻrishingiz mumkin
        </div>
      </div>

      {/* Faculties & Departments Tree */}
      <div className="space-y-5">
        {visibleFaculties.map(faculty => {
          const isExpanded = expandedFaculties[faculty.id] ?? true;
          const totalFacultyTeachers = faculty.departments.reduce((acc, d) => acc + d.teachers_count, 0);
          const facultyAvgScore = faculty.departments.length > 0
            ? Math.round((faculty.departments.reduce((acc, d) => acc + d.avg_score, 0) / faculty.departments.length) * 10) / 10
            : 0;

          return (
            <div
              key={faculty.id}
              className={`rounded-2xl border transition-all ${
                theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {/* Faculty Card Header */}
              <div
                onClick={() => toggleFaculty(faculty.id)}
                className={`p-5 flex items-center justify-between cursor-pointer border-b transition-colors rounded-t-2xl ${
                  theme === "dark"
                    ? "border-slate-800 hover:bg-slate-800/50"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                        {faculty.code}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {faculty.departments.length} ta kafedra
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {faculty.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Dekan: <b className="text-slate-700 dark:text-slate-300">{faculty.dean}</b></span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                        {faculty.dean_fte} stavka
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-400">Fakultet oʻrtacha bali</div>
                    <div className="text-lg font-black text-blue-900 dark:text-blue-400">
                      {facultyAvgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-400">Jami xodimlar</div>
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {totalFacultyTeachers} nafar
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg ${
                      theme === "dark" ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Department Children Grid */}
              {isExpanded && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-b-2xl">
                  {faculty.departments.map(dept => {
                    const isUserDept = userDepartment && (
                      dept.name.toLowerCase().includes(userDepartment.toLowerCase()) ||
                      userDepartment.toLowerCase().includes(dept.name.toLowerCase())
                    );
                    const isSelected = selectedDeptId === dept.id;

                    return (
                      <div
                        key={dept.id}
                        onClick={() => {
                          setSelectedDeptId(dept.id);
                          if (onSelectDepartment) onSelectDepartment(dept.name);
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isUserDept
                            ? "ring-2 ring-blue-600 bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
                            : isSelected
                            ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800"
                            : theme === "dark"
                            ? "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600"
                            : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                                {dept.code}
                              </span>
                              {isUserDept && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Sizning kafedrangiz</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                              {dept.name} kafedrasi
                            </h4>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                              dept.avg_score >= 85
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : dept.avg_score >= 70
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                            }`}>
                              {dept.avg_score} ball
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400">Mudir: </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.head}</span>
                            <span className="ml-1.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                              {dept.head_fte} st
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{dept.teachers_count} oʻqituvchi</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
