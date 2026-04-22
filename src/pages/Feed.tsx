import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Request, Subject } from '../types';
import { RequestCard } from '../components/RequestCard';
import { Button } from '../components/Button';
import { CreateRequestModal } from '../components/CreateRequestModal';
import { Skeleton } from '../components/Skeleton';
import { HelpCircle, Layout, BookOpen, Filter, Search } from 'lucide-react';
import './Feed.css';

const Feed: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState<number | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get<any>('/subjects');
      const subjectsList = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects', error);
    }
  };

  const fetchRequests = async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      let url = `/requests?page=${pageNum}`;
      if (activeSubject) url += `&subjectId=${activeSubject}`;
      if (activeStatus) url += `&status=${activeStatus}`;

      const response = await apiClient.get<any>(url);
      const paginator = response.data.meta ? response.data : response.data.data;
      
      const results = paginator?.data || [];
      const meta = paginator?.meta || { currentPage: 1, lastPage: 1 };

      if (append) {
        setRequests(prev => [...prev, ...results]);
      } else {
        setRequests(results);
      }
      setHasMore(meta.currentPage < meta.lastPage);
    } catch (error) {
      console.error('Error fetching requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchRequests(1);
  }, [activeSubject, activeStatus]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRequests(nextPage, true);
  };

  const handleLike = async (requestId: number) => {
    try {
      await apiClient.post(`/requests/${requestId}/like`);
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, votes_count: (req.votes_count || 0) + 1 } : req
      ));
    } catch (error) {
      console.error('Error liking request', error);
    }
  };

  const handleSubjectFilter = (subjectId: number | null) => {
    setActiveSubject(subjectId);
  };

  return (
    <div className="feed-container">
      <CreateRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setPage(1);
          setActiveSubject(null);
          fetchRequests(1);
        }} 
      />
      <header className="feed-header">
        <div className="header-left">
          <h1>Questions de la <span className="highlight">communauté</span></h1>
          <p>Posez vos questions, partagez vos connaissances, progressez ensemble.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <HelpCircle size={20} /> Poser une question
        </Button>
      </header>

      <div className="feed-layout">
        <aside className="feed-sidebar glass">
          <div className="sidebar-section">
            <h4 className="sidebar-title"><Filter size={14} /> Filtres</h4>
            
            <div 
              className={`sidebar-item ${!activeSubject && !activeStatus ? 'active' : ''}`}
              onClick={() => { setActiveSubject(null); setActiveStatus(null); }}
            >
              <Layout size={16} /> Toutes les questions
            </div>
            <div 
              className={`sidebar-item ${activeStatus === 'pending' ? 'active' : ''}`}
              onClick={() => { setActiveStatus(activeStatus === 'pending' ? null : 'pending'); }}
            >
              <HelpCircle size={16} /> En attente
            </div>
            <div 
              className={`sidebar-item ${activeStatus === 'resolved' ? 'active' : ''}`}
              onClick={() => { setActiveStatus(activeStatus === 'resolved' ? null : 'resolved'); }}
            >
              <BookOpen size={16} /> Résolues
            </div>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title"><BookOpen size={14} /> Matières</h4>
            {subjects.map(subject => (
              <div 
                key={subject.id}
                className={`sidebar-item ${activeSubject === subject.id ? 'active' : ''}`} 
                onClick={() => handleSubjectFilter(activeSubject === subject.id ? null : subject.id)}
              >
                {subject.name}
              </div>
            ))}
          </div>
        </aside>

        <main className="feed-main">
          {loading && page === 1 ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton-card glass">
                <div className="flex justify-between">
                  <Skeleton width={100} height={20} />
                  <Skeleton width={60} height={15} />
                </div>
                <Skeleton width="100%" height={28} className="mt-md" />
                <Skeleton width="100%" height={50} />
                <div className="flex justify-between mt-auto">
                  <div className="flex items-center gap-md">
                    <Skeleton variant="circle" width={26} height={26} />
                    <Skeleton width={80} height={15} />
                  </div>
                  <Skeleton width={120} height={18} />
                </div>
              </div>
            ))
          ) : requests.length === 0 ? (
            <div className="empty-state fade-in">
              <div className="empty-state-icon">🎓</div>
              <h3>Aucune question pour le moment</h3>
              <p>Soyez le premier à poser une question et lancez la discussion !</p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)} className="mt-lg">
                <HelpCircle size={18} /> Poser la première question
              </Button>
            </div>
          ) : (
            requests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onClick={() => navigate(`/requests/${request.id}`)} 
                onLike={() => handleLike(request.id)}
              />
            ))
          )}

          {loading && page > 1 && <div className="loading-state">Chargement...</div>}
          
          {hasMore && !loading && requests.length > 0 && (
            <Button variant="glass" onClick={handleLoadMore} className="load-more">
              Voir plus de questions
            </Button>
          )}

          {!hasMore && requests.length > 0 && (
            <p className="end-message">Vous avez vu toutes les questions ! 🎉</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default Feed;
