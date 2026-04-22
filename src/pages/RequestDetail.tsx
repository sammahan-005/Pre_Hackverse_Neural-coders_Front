import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Request } from '../types';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/timeAgo';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, CheckCircle, Eye, Clock, Award, Send } from 'lucide-react';
import './RequestDetail.css';

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [postingAnswer, setPostingAnswer] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchRequest = async () => {
    try {
      const response = await apiClient.get<any>(`/requests/${id}`);
      const requestData = response.data?.data || response.data;
      setRequest(requestData);
    } catch (error) {
      showToast('Erreur lors du chargement de la question', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setPostingAnswer(true);
    try {
      await apiClient.post(`/requests/${id}/answers`, { 
        content: answerContent,
        requestId: Number(id)
      });
      showToast('Réponse publiée avec succès !', 'success');
      setAnswerContent('');
      fetchRequest();
    } catch (error) {
      showToast('Erreur lors de la publication', 'error');
    } finally {
      setPostingAnswer(false);
    }
  };

  const handleVote = async (answerId: number, type: 'like' | 'dislike') => {
    try {
      await apiClient.post(`/answers/${answerId}/${type}`);
      showToast(type === 'like' ? '👍 Vote enregistré' : '👎 Vote enregistré', 'info');
      fetchRequest();
    } catch (error) {
      showToast('Erreur lors du vote', 'error');
    }
  };

  const handleRequestVote = async (type: 'like' | 'dislike') => {
    try {
      await apiClient.post(`/requests/${id}/${type}`);
      showToast('Vote enregistré', 'info');
      fetchRequest();
    } catch (error) {
      showToast('Erreur lors du vote', 'error');
    }
  };

  const markAsBest = async (answerId: number) => {
    try {
      await apiClient.put(`/answers/${answerId}`, { isBestAnswer: true });
      showToast('Meilleure réponse définie ! 🏆', 'success');
      fetchRequest();
    } catch (error) {
      showToast('Erreur lors de l\'action', 'error');
    }
  };

  const markResolved = async () => {
    try {
      await apiClient.post(`/requests/${id}/resolve`);
      showToast('Question marquée comme résolue ! ✅', 'success');
      fetchRequest();
    } catch (error) {
      showToast('Erreur lors de l\'action', 'error');
    }
  };

  if (loading) return (
    <div className="detail-container fade-in">
      <Skeleton width={150} height={24} className="mb-lg" />
      <div className="request-full glass">
        <Skeleton width={100} height={20} />
        <Skeleton width="80%" height={40} className="mv-md" />
        <div className="flex items-center gap-sm">
          <Skeleton variant="circle" width={28} height={28} />
          <Skeleton width={200} height={15} />
        </div>
        <div className="mt-xl">
          <Skeleton width="100%" height={20} />
          <Skeleton width="100%" height={20} />
          <Skeleton width="60%" height={20} />
        </div>
      </div>
      
      <Skeleton width={150} height={30} className="mb-md" />
      <div className="answer-card glass mb-md">
        <div className="flex justify-between items-center mb-md">
          <div className="flex items-center gap-sm">
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton width={100} height={15} />
          </div>
        </div>
        <Skeleton width="100%" height={60} />
      </div>
    </div>
  );
  if (!request) return null;

  const isAuthor = request.user_id === user?.id;
  const isResolved = request.status === 'resolved';

  return (
    <div className="detail-container fade-in">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Retour aux questions
      </button>

      <article className="request-full glass">
        <header className="request-header">
          <div className="request-meta-top">
            <span className="subject-tag">{request.subject?.name}</span>
            <span className={`status-badge ${isResolved ? 'status-resolved' : 'status-pending'}`}>
              {isResolved ? <><CheckCircle size={10} /> Résolu</> : <><Clock size={10} /> En attente</>}
            </span>
          </div>
          <h1>{request.title}</h1>
          <div className="author-meta">
            <div className="avatar">{request.user?.pseudo?.[0]}</div>
            <span>
              Posé par <strong>{request.user?.pseudo}</strong> · {timeAgo(request.created_at)}
            </span>
          </div>
        </header>

        <div className="request-content">
          {request.content}
        </div>

        <div className="request-stats-bar">
          <div className="request-vote-controls">
            <button className="vote-btn vote-up" onClick={() => handleRequestVote('like')} title="Utile">
              <ThumbsUp size={18} />
            </button>
            <span className="vote-count">{request.votes_count || 0}</span>
            <button className="vote-btn vote-down" onClick={() => handleRequestVote('dislike')} title="Pas utile">
              <ThumbsDown size={18} />
            </button>
          </div>
          <div className="request-stats-info">
            <span><Eye size={15} /> {request.views_count || 0} vues</span>
            <span><MessageSquare size={15} /> {request.answers?.length || 0} réponses</span>
          </div>
          {isAuthor && !isResolved && (
            <Button variant="secondary" size="sm" onClick={markResolved}>
              <CheckCircle size={16} /> Marquer comme résolu
            </Button>
          )}
        </div>
      </article>

      <section className="answers-section">
        <h2>
          <MessageSquare size={22} /> 
          {request.answers?.length || 0} Réponse{(request.answers?.length || 0) !== 1 ? 's' : ''}
        </h2>

        <div className="answers-list">
          {request.answers?.map((answer) => (
            <div key={answer.id} className={`answer-card glass ${answer.is_best_answer ? 'best-answer' : ''}`}>
              {answer.is_best_answer && (
                <div className="best-badge"><Award size={12} /> Meilleure réponse</div>
              )}
              
              <div className="answer-header">
                <div className="user-info">
                  <div className="avatar">{answer.user?.pseudo?.[0]}</div>
                  <div className="answer-author-info">
                    <span className="answer-author-name">{answer.user?.pseudo}</span>
                    <span className="answer-time">{timeAgo(answer.created_at)}</span>
                  </div>
                </div>
                {isAuthor && !request.best_answer_id && !answer.is_best_answer && (
                  <Button variant="glass" size="sm" onClick={() => markAsBest(answer.id)}>
                    <Award size={14} /> Meilleure
                  </Button>
                )}
              </div>

              <div className="answer-content">{answer.content}</div>

              <div className="answer-footer">
                <div className="vote-controls">
                  <button className="vote-btn-sm" onClick={() => handleVote(answer.id, 'like')} title="Utile">
                    <ThumbsUp size={16} />
                  </button>
                  <span className="vote-count-sm">{answer.votes_count || 0}</span>
                  <button className="vote-btn-sm" onClick={() => handleVote(answer.id, 'dislike')} title="Pas utile">
                    <ThumbsDown size={16} />
                  </button>
                </div>
                <span className="pertinence">Score: {Number(answer.pertinence_score || 0).toFixed(1)}</span>
              </div>
            </div>
          ))}

          {(!request.answers || request.answers.length === 0) && (
            <div className="empty-state fade-in">
              <div className="empty-state-icon">💬</div>
              <h3>Pas encore de réponse</h3>
              <p>Soyez le premier à aider ! Partagez votre savoir ci-dessous.</p>
            </div>
          )}
        </div>

        <form onSubmit={handlePostAnswer} className="answer-form glass">
          <h3><Send size={18} /> Votre réponse</h3>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="Partagez votre savoir pour aider un camarade..."
            required
          />
          <Button type="submit" isLoading={postingAnswer} disabled={!answerContent.trim()}>
            <MessageSquare size={18} /> Publier la réponse
          </Button>
        </form>
      </section>
    </div>
  );
};

export default RequestDetail;
