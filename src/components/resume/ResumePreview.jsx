import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail, GraduationCap, Trophy, Users, Heart, Zap, Target } from 'lucide-react';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { toast } from 'sonner';

export default function ResumePreview({ data }) {
  const resumeRef = useRef(null);

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    toast.info('Generating PDF...');
    
    const canvas = await html2canvas(resumeRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data.name || 'resume'}_scholarship_resume.pdf`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div ref={resumeRef} className="bg-white p-8 md:p-12 text-gray-900 min-h-[800px]">
          {/* Header */}
          <div className="border-b-2 border-indigo-500 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
            {data.email && (
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{data.email}</span>
              </div>
            )}
          </div>

          {/* Objective */}
          {data.objective && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" /> Objective
              </h2>
              <p className="text-gray-700 leading-relaxed">{data.objective}</p>
            </section>
          )}

          {/* Education */}
          {data.education && (data.education.school || data.education.level) && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4" /> Education
              </h2>
              <div className="pl-2">
                {data.education.school && <p className="font-semibold text-gray-900">{data.education.school}</p>}
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                  {data.education.level && <span>{data.education.level}</span>}
                  {data.education.major && <span>• {data.education.major}</span>}
                  {data.education.gpa && <span>• GPA: {data.education.gpa}</span>}
                  {data.education.graduation && <span>• Expected {data.education.graduation}</span>}
                </div>
              </div>
            </section>
          )}

          {/* Achievements */}
          {data.achievements?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4" /> Achievements & Awards
              </h2>
              <ul className="space-y-1 pl-2">
                {data.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-indigo-500 mt-1.5 text-xs">●</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Activities */}
          {data.activities?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" /> Activities & Leadership
              </h2>
              <ul className="space-y-1 pl-2">
                {data.activities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-indigo-500 mt-1.5 text-xs">●</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Community Service */}
          {data.community_service?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4" /> Community Service
              </h2>
              <ul className="space-y-1 pl-2">
                {data.community_service.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-indigo-500 mt-1.5 text-xs">●</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills */}
          {data.skills?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" /> Skills
              </h2>
              <div className="flex flex-wrap gap-2 pl-2">
                {data.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Career Goals */}
          {data.career_goals && (
            <section>
              <h2 className="text-lg font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" /> Career Goals
              </h2>
              <p className="text-gray-700 leading-relaxed pl-2">{data.career_goals}</p>
            </section>
          )}
        </div>
      </Card>
    </div>
  );
}