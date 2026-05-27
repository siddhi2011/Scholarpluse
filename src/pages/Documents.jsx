const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, FileText, Trash2, ExternalLink, FolderOpen,
  GraduationCap, Award, FileCheck, Loader2, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  transcript: { label: 'Transcript', icon: GraduationCap, color: 'bg-primary/10 text-primary' },
  recommendation_letter: { label: 'Recommendation Letter', icon: FileCheck, color: 'bg-accent/10 text-accent-foreground' },
  certificate: { label: 'Certificate', icon: Award, color: 'bg-chart-3/10 text-chart-3' },
  resume: { label: 'Resume', icon: FileText, color: 'bg-chart-4/10 text-chart-4' },
  essay: { label: 'Essay', icon: FileText, color: 'bg-chart-5/10 text-chart-5' },
  other: { label: 'Other', icon: FileText, color: 'bg-muted text-muted-foreground' },
};

export default function Documents() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('transcript');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => db.entities.Document.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
  });

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a file'); return; }
    
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file: selectedFile });
    
    await db.entities.Document.create({
      title: docTitle || selectedFile.name,
      type: docType,
      file_url,
      file_name: selectedFile.name,
    });

    queryClient.invalidateQueries({ queryKey: ['documents'] });
    setUploadOpen(false);
    setDocTitle('');
    setSelectedFile(null);
    setUploading(false);
    toast.success('Document uploaded!');
  };

  const groupedDocs = {};
  documents.forEach(doc => {
    const type = doc.type || 'other';
    if (!groupedDocs[type]) groupedDocs[type] = [];
    groupedDocs[type].push(doc);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your scholarship application documents</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Document Name</Label>
                <Input
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Official Transcript"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>File</Label>
                <div
                  className="mt-1.5 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">Click to select a file</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PDF, DOC, PNG, JPG</p>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full gap-1">
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Upload Document</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium">No documents yet</h3>
            <p className="text-muted-foreground mt-1">Upload transcripts, letters, and certificates</p>
            <Button onClick={() => setUploadOpen(true)} className="mt-4 gap-1">
              <Upload className="h-4 w-4" /> Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([type, docs]) => {
            const config = TYPE_CONFIG[type] || TYPE_CONFIG.other;
            const TypeIcon = config.icon;

            return (
              <div key={type}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" /> {config.label}s ({docs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {docs.map(doc => (
                    <Card key={doc.id} className="border-0 shadow-sm">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.file_name} • {format(new Date(doc.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}