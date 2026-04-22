import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/client';
import type { Subject, Request as RequestType, Answer } from '../types';
import { Button } from '../components/Button';
import { timeAgo, getReputationLevel } from '../utils/timeAgo';
import { Award, Star, Settings, MessageSquare, HelpCircle, CheckCircle, Edit3, Save, X } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [userQuestions, setUserQuestions] = useState<RequestType[]>([]);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  const [stats, setStats] = useState({ questions_count: 0, answers_count: 0, best_answers_count: 0 });
  
  // Bio editing
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, favoritesRes, profileRes] = await Promise.all([
          apiClient.get<any>('/subjects'),
          apiClient.get<any>('/account/favorites'),
          apiClient.get<any>('/account/profile'),
        ]);
        
        const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data?.data || [];
        const favoritesData = Array.isArray(favoritesRes.data) ? favoritesRes.data : favoritesRes.data?.data || [];
        const profileData = profileRes.data?.data || profileRes.data;

        setAllSubjects(subjectsData);
        setFavorites(favoritesData.map((s: any) => s.id));
        
        if (profileData?.stats) {
          setStats(profileData.stats);
        }
        setBioText(profileData?.bio || '');

        // Update user in context with fresh data
        if (profileData) {
          updateUser({
            ...user!,
            bio: profileData.bio,
            reputation_score: profileData.reputation_score,
          });
        }
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };
    fetchData();
    fetchUserContent();
  }, []);

  const fetchUserContent = async () => {
    try {
      // Fetch all requests and filter by user
      const reqRes = await apiClient.get<any>('/requests?page=1');
      const paginator = reqRes.data.meta ? reqRes.data : reqRes.data.data;
      const allRequests = paginator?.data || [];
      const myQuestions = allRequests.filter((r: any) => r.user_id === user?.id || r.user?.id === user?.id);
      setUserQuestions(myQuestions);

      // Extract user answers from requests
      const myAnswers: Answer[] = [];
      allRequests.forEach((r: any) => {
        if (r.answers) {
          r.answers.forEach((a: any) => {
            if (a.user_id === user?.id || a.user?.id === user?.id) {
              myAnswers.push({ ...a, request: r });
            }
          });
        }
      });
      setUserAnswers(myAnswers);
    } catch (error) {
      console.error('Error fetching user content', error);
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(fid => fid !== id);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 matières en favoris', 'error');
        return prev;
      }
      return [...prev, id];
    });
  };

  const saveFavorites = async () => {
    setSaving(true);
    try {
      const response = await apiClient.post<any>('/account/favorites', { subjectIds: favorites });
      const newSubjects = response.data?.data || response.data;
      if (newSubjects) {
        updateUser({ ...user!, subjects: newSubjects });
      }
      showToast('Matières favorites mises à jour !', 'success');
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      const response = await apiClient.put<any>('/account/profile', { bio: bioText });
      const profileData = response.data?.data || response.data;
      if (profileData) {
        updateUser({ ...user!, bio: profileData.bio });
      }
      showToast('Bio mise à jour !', 'success');
      setEditingBio(false);
    } catch (error) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSavingBio(false);
    }
  };

  if (!user) return null;

  const repLevel = getReputationLevel(Number(user.reputation_score || 0));

  return (
    <div className="profile-container fade-in">
      <div className="profile-header glass">
        <div className="profile-info">
          <div className="profile-avatar">
            {user.pseudo?.[0]?.toUpperCase()}
          </div>
          <div className="profile-text">
            <h1>{user.pseudo}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-bio-section">
              {editingBio ? (
                <div className="bio-edit">
                  <textarea 
                    value={bioText} 
                    onChange={(e) => setBioText(e.target.value)}
                    placeholder="Présentez-vous en quelques mots..."
                    maxLength={500}
                  />
                  <div className="bio-actions">
                    <Button size="sm" onClick={saveBio} isLoading={savingBio}>
                      <Save size={14} /> Sauvegarder
                    </Button>
                    <Button size="sm" variant="glass" onClick={() => { setEditingBio(false); setBioText(user.bio || ''); }}>
                      <X size={14} /> Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bio-display">
                  <p className="bio-text">{user.bio || 'Aucune bio renseignée.'}</p>
                  <button className="edit-bio-btn" onClick={() => setEditingBio(true)}>
                    <Edit3 size={14} /> Modifier
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="reputation-card">
          <div className="rep-level-badge" style={{ color: repLevel.color }}>
            <span className="rep-emoji">{repLevel.emoji}</span>
            <span className="rep-level-label">{repLevel.label}</span>
          </div>
          <div className="reputation-details">
            <span className="reputation-score">{Number(user.reputation_score || 0).toFixed(0)}</span>
            <span className="reputation-label">Points de Réputation</span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <HelpCircle size={24} className="stat-icon" style={{ color: 'var(--primary)' }} />
          <span className="stat-number">{stats.questions_count}</span>
          <span className="stat-label">Questions posées</span>
        </div>
        <div className="stat-card glass">
          <MessageSquare size={24} className="stat-icon" style={{ color: 'var(--secondary)' }} />
          <span className="stat-number">{stats.answers_count}</span>
          <span className="stat-label">Réponses données</span>
        </div>
        <div className="stat-card glass">
          <Award size={24} className="stat-icon" style={{ color: 'var(--success)' }} />
          <span className="stat-number">{stats.best_answers_count}</span>
          <span className="stat-label">Meilleures réponses</span>
        </div>
      </div>

      <div className="profile-layout">
        {/* Content tabs */}
        <section className="content-section glass">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <HelpCircle size={16} /> Mes Questions ({userQuestions.length})
            </button>
            <button 
              className={`tab ${activeTab === 'answers' ? 'active' : ''}`}
              onClick={() => setActiveTab('answers')}
            >
              <MessageSquare size={16} /> Mes Réponses ({userAnswers.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'questions' && (
              userQuestions.length > 0 ? (
                userQuestions.map(q => (
                  <div key={q.id} className="content-item" onClick={() => navigate(`/requests/${q.id}`)}>
                    <div className="content-item-header">
                      <h4>{q.title}</h4>
                      <span className={`status-badge ${q.status === 'resolved' ? 'status-resolved' : 'status-pending'}`}>
                        {q.status === 'resolved' ? <><CheckCircle size={10} /> Résolu</> : 'En attente'}
                      </span>
                    </div>
                    <p>{q.content?.substring(0, 100)}...</p>
                    <div className="content-item-meta">
                      <span>{timeAgo(q.created_at)}</span>
                      <span>{q.answers?.length || 0} réponses</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">📝</div>
                  <h3>Aucune question posée</h3>
                  <p>Commencez par poser votre première question !</p>
                </div>
              )
            )}

            {activeTab === 'answers' && (
              userAnswers.length > 0 ? (
                userAnswers.map(a => (
                  <div key={a.id} className="content-item" onClick={() => navigate(`/requests/${a.request_id}`)}>
                    <div className="content-item-header">
                      <h4>{(a as any).request?.title || 'Question'}</h4>
                      {a.is_best_answer && (
                        <span className="status-badge status-resolved"><Award size={10} /> Meilleure</span>
                      )}
                    </div>
                    <p>{a.content?.substring(0, 100)}...</p>
                    <div className="content-item-meta">
                      <span>{timeAgo(a.created_at)}</span>
                      <span>{a.votes_count || 0} votes</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <h3>Aucune réponse donnée</h3>
                  <p>Aidez la communauté en répondant aux questions !</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Sidebar */}
        <div className="profile-sidebar">
          <section className="favorites-section glass">
            <div className="section-header">
              <Star size={18} />
              <h2>Matières Favorites</h2>
            </div>
            <p className="helper-text">Sélectionnez jusqu'à 3 matières pour personnaliser votre flux.</p>
            
            <div className="subjects-grid">
              {allSubjects.map(subject => (
                <div 
                  key={subject.id} 
                  className={`subject-pill ${favorites.includes(subject.id) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(subject.id)}
                >
                  {subject.name}
                </div>
              ))}
            </div>

            <Button 
              onClick={saveFavorites} 
              isLoading={saving} 
              disabled={favorites.length === 0}
              className="save-btn"
            >
              Sauvegarder les matières
            </Button>
          </section>

          <section className="info-section glass">
            <div className="section-header">
              <Settings size={18} />
              <h2>Informations</h2>
            </div>
            <div className="info-box">
              <p><strong>Membre depuis :</strong> {new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
