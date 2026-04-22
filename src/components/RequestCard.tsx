import React from 'react';
import type { Request } from '../types';
import { MessageSquare, ThumbsUp, Eye, CheckCircle, Clock } from 'lucide-react';
import { timeAgo } from '../utils/timeAgo';
import './RequestCard.css';

interface RequestCardProps {
  request: Request;
  onClick: () => void;
  onLike?: (e: React.MouseEvent) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onClick, onLike }) => {
  const isResolved = request.status === 'resolved';

  return (
    <div className={`request-card glass fade-in ${isResolved ? 'card-resolved' : ''}`} onClick={onClick}>
      <div className="card-header">
        <div className="card-tags">
          <span className="subject-tag">{request.subject?.name || 'Général'}</span>
          <span className={`status-badge ${isResolved ? 'status-resolved' : 'status-pending'}`}>
            {isResolved ? <><CheckCircle size={10} /> Résolu</> : <><Clock size={10} /> En attente</>}
          </span>
        </div>
        <span className="card-time" title={new Date(request.created_at).toLocaleString()}>
          {timeAgo(request.created_at)}
        </span>
      </div>

      <h3 className="card-title">{request.title}</h3>
      <p className="card-content">{request.content?.substring(0, 150)}{(request.content?.length || 0) > 150 ? '...' : ''}</p>

      <div className="card-footer">
        <div className="user-info">
          <div className="avatar">{request.user?.pseudo?.[0] || '?'}</div>
          <span>{request.user?.pseudo || 'Anonyme'}</span>
        </div>

        <div className="stats">
          <span 
            title="Voter" 
            className={`stat-item ${onLike ? 'stat-clickable' : ''}`}
            onClick={(e) => {
              if (onLike) {
                e.stopPropagation();
                onLike(e);
              }
            }}
          >
            <ThumbsUp size={15} /> {request.votes_count || 0}
          </span>
          <span title="Réponses" className="stat-item">
            <MessageSquare size={15} /> {request.answers?.length || 0}
          </span>
          <span title="Vues" className="stat-item">
            <Eye size={15} /> {request.views_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
};
