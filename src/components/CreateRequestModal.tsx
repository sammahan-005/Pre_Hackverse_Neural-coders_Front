import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { Subject } from '../types';
import { Button } from './Button';
import { X, Send, HelpCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './CreateRequestModal.css';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const isTitleValid = title.trim().length >= 5;
  const isContentValid = content.trim().length >= 10;
  const isFormValid = isTitleValid && isContentValid && subjectId !== '';

  useEffect(() => {
    if (isOpen) {
      const fetchSubjects = async () => {
        try {
          const response = await apiClient.get<any>('/subjects');
          const subjectsList = Array.isArray(response.data) ? response.data : response.data?.data || [];
          setSubjects(subjectsList);
          if (subjectsList.length > 0) setSubjectId(subjectsList[0].id);
        } catch (error) {
          console.error('Error fetching subjects', error);
        }
      };
      fetchSubjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!isFormValid) return;

    setLoading(true);
    try {
      await apiClient.post('/requests', {
        title,
        content,
        subjectId: Number(subjectId),
      });
      showToast('Votre question a été publiée !', 'success');
      setTitle('');
      setContent('');
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
        showToast('Veuillez corriger les erreurs dans le formulaire', 'error');
      } else {
        showToast('Erreur lors de la publication', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass fade-in" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-title-row">
            <HelpCircle size={24} className="modal-icon" />
            <h2>Poser une question</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <p className="modal-description">
          Décrivez votre problème clairement pour obtenir les meilleures réponses de la communauté.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Matière / Thématique</label>
            <select 
              value={subjectId} 
              onChange={(e) => setSubjectId(Number(e.target.value))}
              required
              className={errors.subjectId ? 'error' : ''}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subjectId && <span className="error-message">{errors.subjectId}</span>}
          </div>

          <div className="form-group">
            <label>
              Titre de votre question
              <span className={`char-count ${!isTitleValid && title.length > 0 ? 'invalid' : ''}`}>
                {title.length}/5 minimum
              </span>
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ex: Comment résoudre une intégrale par parties ?"
              className={errors.title ? 'error' : ''}
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>
              Détaillez votre question
              <span className={`char-count ${!isContentValid && content.length > 0 ? 'invalid' : ''}`}>
                {content.length}/10 minimum
              </span>
            </label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Expliquez le contexte, ce que vous avez déjà essayé, et ce que vous ne comprenez pas..."
              className={errors.content ? 'error' : ''}
              required
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          <div className="modal-actions">
            <Button type="button" variant="glass" onClick={onClose}>Annuler</Button>
            <Button type="submit" isLoading={loading} disabled={!isFormValid || loading}>
              <Send size={18} /> Publier la question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
