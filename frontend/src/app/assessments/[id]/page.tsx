"use client";

import { useEffect, useMemo, useState } from 'react';
import Toolbar from '../../../components/assessments/Toolbar';
import TabsHeader, { TabKey } from '../../../components/assessments/TabsHeader';
import LeftTree from '../../../components/assessments/LeftTree';
import SectionPanel from '../../../components/assessments/SectionPanel';
import MessagesPanel from '../../../components/assessments/MessagesPanel';
import TasksPanel from '../../../components/assessments/TasksPanel';
import AttachmentsPanel from '../../../components/assessments/AttachmentsPanel';
import CollaboratorsPanel from '../../../components/assessments/CollaboratorsPanel';
import CreateTaskModal from '../../../components/assessments/CreateTaskModal';
import { getTasks, createTask, getMessages, postMessage, getAttachments, TaskItem, MessageItem, AttachmentItem, getSectionAttachments, linkSectionAttachments, unlinkSectionAttachment, uploadAttachment, getAssessmentStructure, FrameworkStructure } from '../../../services/assessments';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../../components/ToastProvider';
import { useAuth } from '../../../contexts/AuthContext';

export default function AssessmentDetail(){
  const params = useParams<{ id: string }>();
  const id = params?.id || (typeof window!=='undefined' ? location.pathname.split('/').pop() as string : 'A-001');
  const { user: authUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const validTabs: TabKey[] = useMemo(()=>['section','tasks','attachments','messages','collaborators'],[]);
  const initialTab = ((): TabKey => {
    const t = (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('tab') || '') : (searchParams?.get('tab') || '')).toLowerCase();
    return validTabs.includes(t as TabKey) ? (t as TabKey) : 'section';
  })();
  const [tab, setTab] = useState<TabKey>(initialTab);

  const setTabAndUrl = (t: TabKey) => {
    setTab(t);
    const sp = new URLSearchParams(searchParams?.toString() || (typeof window !== 'undefined' ? window.location.search : ''));
    sp.set('tab', t);
    router.replace(`?${sp.toString()}`, { scroll: false });
  };
  const [openTask, setOpenTask] = useState(false);
  const [activeSub, setActiveSub] = useState<string>(((typeof window !== 'undefined') ? (new URLSearchParams(window.location.search).get('sub') || '') : (searchParams?.get('sub') || '')));
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for save events to refresh LeftTree coloring
  useEffect(() => {
    function onSaved(e: any) { setRefreshKey(k => k + 1); }
    if (typeof window !== 'undefined') {
      window.addEventListener('answers-saved', onSaved as any);
      return () => window.removeEventListener('answers-saved', onSaved as any);
    }
  }, []);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [structure, setStructure] = useState<FrameworkStructure | null>(null);
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  useEffect(()=>{
    if (!id) return;
    getTasks(id).then(setTasks).catch(()=>{});
    getMessages(id).then(setMessages).catch(()=>{});
    getAttachments(id).then(setAttachments).catch(()=>{});
    getAssessmentStructure(id).then(setStructure).catch(()=>{});
  },[id]);

  // Load linked attachment ids for the active subsection when on the attachments tab
  useEffect(()=>{
    if (!id || !activeSub || tab !== 'attachments') { setLinkedIds([]); return; }
    getSectionAttachments(id, activeSub)
      .then(res => setLinkedIds(res.ids))
      .catch(()=>setLinkedIds([]));
  }, [id, activeSub, tab]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      <Toolbar
        onCreateTask={() => setOpenTask(true)}
        onExport={async () => {
          try {
            const choice = typeof window !== 'undefined' ? (window.prompt('Export format (docx/pdf)?', 'docx') || '').toLowerCase().trim() : 'docx';
            if (choice === 'pdf') {
              showToast('PDF export coming soon', 'info');
              return;
            }
            if (choice && choice !== 'docx') {
              showToast('Unsupported format', 'error');
              return;
            }
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
            const template = 'Template.docx'; // place your template file in /root/template/report.docx
            const url = `${base}/assessments/${id}/export.docx?template=${encodeURIComponent(template)}`;
            if (typeof window !== 'undefined') window.open(url, '_blank');
            showToast('Export started', 'success');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Export failed';
            showToast(msg, 'error');
          }
        }}
      />
      <TabsHeader active={tab} onChange={setTabAndUrl} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-4 xl:col-span-3 bg-card border rounded p-4">
          <LeftTree assessmentId={id} activeSub={activeSub} onSelect={setActiveSub} refreshKey={refreshKey} />
        </aside>
        <section className="col-span-12 lg:col-span-8 xl:col-span-9 bg-card border rounded">
          {tab === 'section' && activeSub && (
            <SectionPanel assessmentId={id} subsectionId={activeSub} onSubsectionChange={setActiveSub} />
          )}
          {tab === 'tasks' && <TasksPanel tasks={tasks} />}
          {tab === 'messages' && (
            <MessagesPanel
              items={messages}
              attachments={attachments}
              structure={structure} currentSubId={activeSub}
              onSend={async (text, opts) => {
                try {
                  const user = (authUser?.name || authUser?.email || 'User');
                  const msg = await postMessage(id, { user, text, parentId: opts?.parentId || null, sections: opts?.sections || [], attachments: opts?.attachments || [] });
                  setMessages(prev => [...prev, msg]);
                  showToast('Message sent','success');
                } catch (e: any) {
                  const status = e?.status ?? 0;
                  if (status === 401) {
                    showToast('Please sign in to post messages (401)', 'error');
                  } else {
                    showToast(e?.message || 'Failed to post message', 'error');
                  }
                }
              }}
              onDelete={async (msgId) => {
                try {
                  const base = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
                  const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
                  const res = await fetch(`${base}/assessments/${id}/messages/${msgId}`, { method: 'DELETE', headers: t ? { Authorization: `Bearer ${t}` } : {} });
                  const j = await res.json();
                  if (!res.ok || !j.success) throw new Error(j.message || 'Failed to delete');
                  setMessages(prev => prev.filter(m => m.id !== msgId));
                  showToast('Message deleted','success');
                } catch(e) {
                  const msg = e instanceof Error ? e.message : 'Failed to delete';
                  showToast(msg,'error');
                }
              }}
              onJumpToAttachment={(attId) => { setTabAndUrl('attachments'); }}
              onJumpToSection={(subId) => { setActiveSub(subId); setTabAndUrl('section'); }}
            />
          )}
          
          {tab === 'attachments' && (
            <AttachmentsPanel
              items={attachments}
              activeSub={activeSub}
              linkedIds={linkedIds}
              onUpload={async (file, linkToCurrent) => {
                try {
                  const att = await uploadAttachment(id, file);
                  setAttachments(prev => [att, ...prev]);
                  if (linkToCurrent && activeSub) {
                    const res = await linkSectionAttachments(id, activeSub, [att.id], []);
                    setLinkedIds(res.ids);
                  }
                  showToast('Attachment uploaded','success');
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Upload failed';
                  showToast(msg, 'error');
                }
              }}
              onToggleLink={async (attId, next) => {
                try {
                  if (!activeSub) return;
                  if (next) {
                    const res = await linkSectionAttachments(id, activeSub, [attId], []);
                    setLinkedIds(res.ids);
                    showToast('Linked to section','success');
                  } else {
                    await unlinkSectionAttachment(id, activeSub, attId);
                    setLinkedIds(prev => prev.filter(x => x !== attId));
                    showToast('Unlinked from section','success');
                  }
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Update failed';
                  showToast(msg, 'error');
                }
              }}
              onDelete={async (attId) => {
                if (!window.confirm('Delete this attachment?')) return;
                try {
                  const base = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
                  const t = (typeof window!=='undefined') ? localStorage.getItem('auth_token') : null;
                  const res = await fetch(`${base}/assessments/${id}/attachments/${attId}`, { method: 'DELETE', headers: t ? { Authorization: `Bearer ${t}` } : {} });
                  const j = await res.json();
                  if (!res.ok || !j.success) throw new Error(j.message || 'Failed to delete');
                  setAttachments(prev => prev.filter(a => a.id !== attId));
                  setLinkedIds(prev => prev.filter(x => x !== attId));
                  showToast('Attachment deleted','success');
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Failed to delete';
                  showToast(msg, 'error');
                }
              }}
              onDownload={(attId) => { showToast('Download started','info'); }}
            />
          )}
          {tab === 'collaborators' && (
            <CollaboratorsPanel assessmentId={id} />
          )}
        </section>
      </div>
      <CreateTaskModal
        open={openTask}
        onClose={() => setOpenTask(false)}
        onCreate={async ({ name, status, due }) => {
          try {
            const t = await createTask(id, { name, status, due });
            setTasks(prev => [...prev, t]);
            showToast('Task created','success');
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Failed to create task';
            showToast(msg,'error');
          }
        }}
      />
    </div>
  );
}
