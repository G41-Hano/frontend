import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import ClassroomHeader from './ClassroomHeader';

const initialDrill = {
  title: '',
  description: '',
  openDate: '',
  dueDate: '',
  questions: [],
  status: 'draft',
};

const emptyQuestion = {
  text: '',
  type: 'M', // 'M' for Multiple Choice, 'F' for Fill in the Blank, 'D' for Drag and Drop
  choices: [
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
    { text: '', media: null },
  ],
  answer: 0,
  blankPosition: null, // For Fill in the Blank questions
  dragItems: [], // For Drag and Drop questions
  dropZones: [], // For Drag and Drop questions
};

const Stepper = ({ step }) => (
  <div className="flex justify-center gap-4 mb-8">
    {["Overview", "Add Questions", "Review"].map((label, i) => (
      <div key={label} className={`flex items-center gap-2 ${step === i ? 'font-bold text-[#4C53B4]' : 'text-gray-400'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-300 bg-white'}`}>{i+1}</div>
        <span>{label}</span>
        {i < 2 && <div className="w-8 h-1 bg-gray-200 rounded-full" />}
      </div>
    ))}
  </div>
);

const FileInput = ({ value, onChange, onPreview }) => {
  const isFile = value instanceof File;
  const src = isFile ? URL.createObjectURL(value) : (value && value.url ? value.url : '');
  const [inputKey, setInputKey] = useState(0);
  const handleRemove = () => {
    onChange(null);
    setInputKey(k => k + 1);
  };
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <label className="cursor-pointer px-3 py-1 bg-[#EEF1F5] rounded-lg border border-gray-200 text-sm text-[#4C53B4] hover:bg-[#e6e9ff]">
        <i className="fa-solid fa-paperclip mr-1"></i> {value ? 'Change File' : 'Add File'}
        <input
          key={inputKey}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files[0];
            if (!file) return;
            onChange(file);
          }}
        />
      </label>
      {src && value && value.type && value.type.startsWith('image/') && (
        <div className="relative mt-1 w-full">
          <img
            src={src}
            alt="preview"
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {src && value && value.type && value.type.startsWith('video/') && (
        <div className="relative mt-1 w-full">
          <video
            src={src}
            className="w-full max-h-48 object-cover rounded border cursor-pointer"
            controls
            onClick={() => onPreview && onPreview(src, value.type)}
          />
          <button
            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-red-500 hover:text-red-700"
            onClick={handleRemove}
            type="button"
            style={{lineHeight:0}}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}
      {value && value.name && (
        <span className="truncate max-w-[120px] text-xs text-gray-500 mt-1">{value.name}</span>
      )}
    </div>
  );
};

const CreateDrill = ({ onDrillCreated, classroom, students }) => {
  const [step, setStep] = useState(0);
  const [drill, setDrill] = useState(initialDrill);
  const [questionEditIdx, setQuestionEditIdx] = useState(null);
  const [questionDraft, setQuestionDraft] = useState(emptyQuestion);
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState('');
  const [mediaModal, setMediaModal] = useState({ open: false, src: '', type: '' });
  const [submittingAction, setSubmittingAction] = useState(null); // null, 'draft', or 'published'
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const questionFormRef = useRef(null);

  useEffect(() => {
    if (!drill.openDate) return;
    const open = new Date(drill.openDate);
    open.setMinutes(open.getMinutes() + 10);
    const minDue = open.toISOString().slice(0, 16);
    if (drill.dueDate && drill.dueDate < minDue) {
      setDrill(d => ({ ...d, dueDate: minDue }));
    }
  }, [drill.openDate, drill.dueDate]);

  // Step 1: Overview
  const handleOverviewChange = e => {
    setDrill({ ...drill, [e.target.name]: e.target.value });
  };

  // Step 2: Questions
  const startAddQuestion = () => {
    setQuestionDraft(emptyQuestion);
    setQuestionEditIdx(null);
  };
  const handleChoiceChange = (i, field, value) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };
  const handleChoiceMedia = (i, file) => {
    const newChoices = questionDraft.choices.map((c, idx) => idx === i ? { ...c, media: file } : c);
    setQuestionDraft({ ...questionDraft, choices: newChoices });
  };

  // Step 3: Review
  const handleSubmit = async (status = 'draft') => {
    // Start loading state
    setSubmittingAction(status);
    
    // Validate: each choice must have text or media
    for (const q of drill.questions) {
      if (q.type === 'M') {
        for (const c of q.choices) {
          if (!c.text && !c.media) {
            alert('Each choice in Multiple Choice must have text or media.');
            setSubmittingAction(null);
            return;
          }
        }
      }
      if (q.type === 'F') {
        for (const c of q.choices) {
          if (!c.text) {
            alert('Each possible answer in Fill in the Blank must have text.');
            setSubmittingAction(null);
            return;
          }
        }
      }
    }
    try {
      const formData = new FormData();
      const questions = drill.questions.map((q, qIdx) => {
        if (q.type === 'M' || q.type === 'F') {
          return {
            ...q,
            choices: q.choices.map((c, cIdx) => {
              let choice = { ...c, is_correct: q.answer === cIdx };
              if (c.media instanceof File) {
                const key = `media_${qIdx}_${cIdx}`;
                formData.append(key, c.media);
                choice.media = key;
              }
              return choice;
            }),
          };
        }
        // handle other types similarly if needed
        return q;
      });
      formData.append('title', drill.title);
      formData.append('description', drill.description);
      formData.append('deadline', drill.dueDate);
      formData.append('classroom', classroom.id);
      formData.append('questions_input', JSON.stringify(questions)); // NOTE: use questions_input for backend
      formData.append('status', status);
      await api.post('/api/drills/', formData);
      setDrill(prev => ({ ...prev, status }));
      setSuccessMsg('Drill created successfully!');
      if (onDrillCreated) onDrillCreated();
      setTimeout(() => {
        setSuccessMsg('');
        setSearchParams({});
        setSubmittingAction(null);
      }, 2000);
    } catch (err) {
      setSubmittingAction(null);
      if (err.response && err.response.data) {
        alert('Failed to create drill: ' + JSON.stringify(err.response.data));
      } else {
        alert('Failed to create drill: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Add this function after handleOverviewChange
  const validateOverviewFields = () => {
    if (!drill.title || !drill.openDate || !drill.dueDate) return false;
    const open = new Date(drill.openDate);
    const due = new Date(drill.dueDate);
    // At least 10 minutes difference
    return due.getTime() - open.getTime() >= 10 * 60 * 1000;
  };

  // Add this function after validateOverviewFields
  const getMinOpenDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const getMinDueDate = () => {
    if (!drill.openDate) return getMinOpenDate();
    const open = new Date(drill.openDate);
    open.setMinutes(open.getMinutes() + 10);
    return open.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      {/* Media Modal */}
      {mediaModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(246, 241, 241, 0.25)', backdropFilter: 'blur(8px)' }}
          onClick={() => setMediaModal({ open: false, src: '', type: '' })}
        >
          <button
            className="fixed top-6 right-8 z-50 flex items-center justify-center w-12 h-12 bg-white text-3xl text-red-500 rounded-full shadow-lg border-2 border-white hover:bg-red-100 hover:text-red-700 transition"
            style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setMediaModal({ open: false, src: '', type: '' }); }}
            aria-label="Close preview"
          >
            &times;
          </button>
          {mediaModal.type.startsWith('image/') ? (
            <img
              src={mediaModal.src}
              alt="media"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          ) : mediaModal.type.startsWith('video/') ? (
            <video
              src={mediaModal.src}
              controls
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl bg-black/70"
              onClick={e => e.stopPropagation()}
            />
          ) : null}
        </div>
      )}
      {/* Header */}
      <ClassroomHeader
        classroom={classroom}
        students={students}
        onEdit={() => {}}
        onDelete={() => {}}
        onBack={() => navigate(-1)}
      />
      {/* Drill Creation Form */}
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-[95%] mx-auto">
        <Stepper step={step} />
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Drill Overview</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Drill Title <span className="text-red-500">*</span>
              </label>
              <input name="title" value={drill.title} onChange={handleOverviewChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                Description
              </label>
              <textarea name="description" value={drill.description} onChange={handleOverviewChange} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium">
                  Open Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="openDate"
                  value={drill.openDate}
                  onChange={handleOverviewChange}
                  min={getMinOpenDate()}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={drill.dueDate}
                  onChange={handleOverviewChange}
                  min={getMinDueDate()}
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                />
                {drill.openDate && (
                  <div className="text-xs mt-1 text-gray-500">
                    {drill.dueDate && new Date(drill.dueDate) - new Date(drill.openDate) < 10 * 60 * 1000 && (
                      <span className="text-red-500 ml-2">Due date must be at least 10 minutes after open date.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={() => navigate(-1)}>Cancel</button>
              <button
                className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                onClick={() => setStep(1)}
                disabled={!validateOverviewFields()}
                style={{ opacity: validateOverviewFields() ? 1 : 0.5, cursor: validateOverviewFields() ? 'pointer' : 'not-allowed' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Add Questions</h2>
            {notification.show && (
              <div className={`mb-4 p-3 rounded-xl text-center font-semibold animate-fadeIn ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                notification.type === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {notification.message}
              </div>
            )}
            <div className="mb-6">
              {drill.questions.length === 0 && <div className="text-gray-400 mb-2">No questions yet.</div>}
              {drill.questions.map((q, idx) => (
                <div key={idx} className="mb-4 p-4 rounded-xl border-2 border-gray-100 bg-[#F7F9FC] relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      className="text-[#4C53B4] hover:bg-[#EEF1F5] hover:scale-110 transition p-1 rounded"
                      onClick={() => {
                        setQuestionDraft(q);
                        setQuestionEditIdx(idx);
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Editing question ${idx+1}`,
                          type: 'info'
                        });
                        
                        // Scroll to the question form
                        setTimeout(() => {
                          questionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          // Auto-hide notification after a few seconds
                          setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                          document.getElementById('question-text-input')?.focus();
                        }, 100);
                      }}
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      className="text-red-500 hover:bg-red-100 hover:scale-110 transition p-1 rounded"
                      onClick={() => {
                        setDrill(prev => ({
                          ...prev,
                          questions: prev.questions.filter((_, i) => i !== idx)
                        }));
                        
                        if (questionEditIdx === idx) {
                          setQuestionDraft(emptyQuestion);
                          setQuestionEditIdx(null);
                        }
                        
                        // Show notification
                        setNotification({
                          show: true,
                          message: `Question ${idx+1} deleted`,
                          type: 'warning'
                        });
                        
                        // Auto-hide notification after a few seconds
                        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                      }}
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                  <div className="font-medium mb-2">Q{idx+1}: {q.type === 'F'
                    ? <>
                        {(q.text || '').split('_')[0]}
                        <span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />
                        {(q.text || '').split('_')[1]}
                      </>
                    : q.text}
                  </div>
                  {q.type === 'M' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div
                          key={i}
                          className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}
                        >
                          {c.media ? (
                            (() => {
                              let src = null;
                              let type = '';
                              if (c.media instanceof File) {
                                src = URL.createObjectURL(c.media);
                                type = c.media.type;
                              } else if (c.media && c.media.url) {
                                src = c.media.url;
                                type = c.media.type || '';
                              }
                              if (type.startsWith('image/')) {
                                return (
                                  <img
                                    src={src}
                                    alt="preview"
                                    className="rounded w-full h-full object-contain border cursor-pointer"
                                    onClick={() => setMediaModal({ open: true, src, type })}
                                  />
                                );
                              } else if (type.startsWith('video/')) {
                                return (
                                  <video
                                    src={src}
                                    className="rounded w-full h-full object-contain border cursor-pointer"
                                    controls
                                    onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }}
                                  />
                                );
                              }
                              return null;
                            })()
                          ) : c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <i className="fa-regular fa-image text-lg text-gray-200"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'F' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div
                          key={i}
                          className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}
                        >
                          {c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No content</span>
                          )}
                        </div>
                      ))}
                      <div className="w-full text-xs text-gray-500 mt-2">
                        Correct: Choice {q.answer + 1}
                      </div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-2 font-semibold">Drag and Drop Mapping:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium mb-1">Drag Items</div>
                          <ul className="space-y-1">
                            {(q.dragItems || []).map((item, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded">{item.text}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Drop Zones</div>
                          <ul className="space-y-1">
                            {(q.dropZones || []).map((zone, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded flex items-center gap-2">
                                <span>{zone.text}</span>
                                {zone.correctItemIndex !== null && (q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex] && (
                                  <span className="ml-2 text-xs text-gray-500">→ {(q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex].text}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Add/Edit Question Form */}
            <div className="mb-6 p-6 rounded-xl border-2 border-gray-100 bg-[#F7F9FC]" ref={questionFormRef}>
              <div className="mb-2 font-bold text-lg">{questionEditIdx !== null ? 'Edit' : 'Add'} Question</div>
              {/* Question Type Selection */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Question Type</label>
                <select
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                  value={questionDraft.type}
                  onChange={e => {
                    const newType = e.target.value;
                    setQuestionDraft({
                      ...questionDraft,
                      type: newType,
                      text: '',
                      choices: emptyQuestion.choices.map(() => ({ text: '', media: null })),
                      answer: 0,
                      dragItems: newType === 'D' ? [] : [],
                      dropZones: newType === 'D' ? [] : [],
                    });
                  }}
                >
                  <option value="M">Multiple Choice</option>
                  <option value="F">Fill in the Blank</option>
                  <option value="D">Drag and Drop</option>
                </select>
              </div>
              {/* Question Text Input */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Question Text</label>
                {questionDraft.type === 'F' ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                        placeholder="Enter text before the blank"
                        value={questionDraft.text.split('_')[0] || ''}
                        onChange={e => {
                          const parts = questionDraft.text.split('_');
                          setQuestionDraft({
                            ...questionDraft,
                            text: e.target.value + '_' + (parts[1] || '')
                          });
                        }}
                      />
                      <span className="text-gray-500">_</span>
                      <input
                        className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                        placeholder="Enter text after the blank"
                        value={questionDraft.text.split('_')[1] || ''}
                        onChange={e => {
                          const parts = questionDraft.text.split('_');
                          setQuestionDraft({
                            ...questionDraft,
                            text: (parts[0] || '') + '_' + e.target.value
                          });
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Possible Answers</label>
                      <div className="flex gap-2 mb-2">
                        {questionDraft.choices.map((c, i) => (
                          <div key={i} className="flex-1 flex flex-col gap-1">
                            <input
                              className="w-full border-2 border-gray-100 rounded-xl px-2 py-1 focus:border-[#4C53B4]"
                              placeholder={`Answer ${i+1}`}
                              value={c.text}
                              onChange={e => handleChoiceChange(i, 'text', e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : questionDraft.type === 'D' ? (
                  <div className="space-y-4">
                    <input
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                      placeholder="Question text"
                      value={questionDraft.text}
                      onChange={e => setQuestionDraft({ ...questionDraft, text: e.target.value })}
                    />
                    {/* Drag Items Section */}
                    <div className="space-y-2">
                      <label className="block font-medium">Drag Items (What students will drag)</label>
                      <div className="text-sm text-gray-500 mb-2">Example: Countries, dates, names, etc.</div>
                      {(questionDraft.dragItems || []).map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                            placeholder={`Drag Item ${index + 1}`}
                            value={item.text}
                            onChange={e => {
                              const newItems = [...questionDraft.dragItems];
                              newItems[index] = { ...newItems[index], text: e.target.value };
                              setQuestionDraft({ ...questionDraft, dragItems: newItems });
                            }}
                          />
                          <button
                            className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => {
                              const newItems = questionDraft.dragItems.filter((_, i) => i !== index);
                              setQuestionDraft({ ...questionDraft, dragItems: newItems });
                            }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]"
                        onClick={() => {
                          setQuestionDraft({
                            ...questionDraft,
                            dragItems: [...questionDraft.dragItems, { text: '', isCorrect: false }]
                          });
                        }}
                      >
                        <i className="fa-solid fa-plus mr-2"></i> Add Drag Item
                      </button>
                    </div>
                    {/* Drop Zones Section */}
                    <div className="space-y-2">
                      <label className="block font-medium">Drop Zones (Where students will drop items)</label>
                      <div className="text-sm text-gray-500 mb-2">Example: Capitals, definitions, answers, etc.</div>
                      {(questionDraft.dropZones || []).map((zone, index) => (
                        <div key={index} className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                              placeholder={`Drop Zone ${index + 1}`}
                              value={zone.text}
                              onChange={e => {
                                const newZones = [...questionDraft.dropZones];
                                newZones[index] = { ...newZones[index], text: e.target.value };
                                setQuestionDraft({ ...questionDraft, dropZones: newZones });
                              }}
                            />
                            <button
                              className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                              onClick={() => {
                                const newZones = questionDraft.dropZones.filter((_, i) => i !== index);
                                setQuestionDraft({ ...questionDraft, dropZones: newZones });
                              }}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Correct Answer:</label>
                            <select
                              className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                              value={zone.correctItemIndex ?? ''}
                              onChange={e => {
                                const newZones = [...questionDraft.dropZones];
                                newZones[index] = { 
                                  ...newZones[index], 
                                  correctItemIndex: e.target.value === '' ? null : parseInt(e.target.value)
                                };
                                setQuestionDraft({ ...questionDraft, dropZones: newZones });
                              }}
                            >
                              <option value="">Select correct answer</option>
                              {(questionDraft.dragItems || []).map((item, i) => (
                                <option key={i} value={i}>
                                  {item.text || `Drag Item ${i + 1}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                      <button
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#4C53B4] hover:text-[#4C53B4]"
                        onClick={() => {
                          setQuestionDraft({
                            ...questionDraft,
                            dropZones: [...questionDraft.dropZones, { text: '', correctItemIndex: null }]
                          });
                        }}
                      >
                        <i className="fa-solid fa-plus mr-2"></i> Add Drop Zone
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    placeholder="Question text"
                    value={questionDraft.text}
                    onChange={e => setQuestionDraft({ ...questionDraft, text: e.target.value })}
                    id="question-text-input"
                  />
                )}
              </div>
              {/* Choices Section - Only show for Multiple Choice */}
              {questionDraft.type === 'M' && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Choices</label>
                  <div className="flex gap-2 mb-2">
                    {questionDraft.choices.map((c, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-1">
                        <input
                          className="w-full border-2 border-gray-100 rounded-xl px-2 py-1 focus:border-[#4C53B4]"
                          placeholder={`Choice ${i+1}`}
                          value={c.text}
                          onChange={e => handleChoiceChange(i, 'text', e.target.value)}
                        />
                        <FileInput value={c.media} onChange={file => handleChoiceMedia(i, file)} onPreview={(src, type) => setMediaModal({ open: true, src, type })} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Correct Answer Selection - Only show for Multiple Choice and Fill in the Blank */}
              {(questionDraft.type === 'M' || questionDraft.type === 'F') && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Correct Answer</label>
                  <select
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
                    value={questionDraft.answer}
                    onChange={e => setQuestionDraft({ ...questionDraft, answer: parseInt(e.target.value) })}
                  >
                    {questionDraft.choices.map((_, i) => (
                      <option key={i} value={i}>
                        {questionDraft.type === 'F' ? `Answer ${i+1}` : `Choice ${i+1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Add/Edit Question Buttons */}
              <div className="flex justify-end gap-2">
                {questionEditIdx !== null && (
                  <button className="px-4 py-1 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={startAddQuestion}>
                    Cancel
                  </button>
                )}
                <button
                  className="px-4 py-1 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                  onClick={() => {
                    const newQ = {
                      ...questionDraft,
                      choices: questionDraft.choices.map(c => ({ ...c }))
                    };
                    if (questionEditIdx !== null) {
                      const updatedQuestions = [...drill.questions];
                      updatedQuestions[questionEditIdx] = newQ;
                      setDrill(prev => ({ ...prev, questions: updatedQuestions }));
                      
                      // Show notification for edit
                      setNotification({
                        show: true,
                        message: `Question ${questionEditIdx+1} updated successfully`,
                        type: 'success'
                      });
                    } else {
                      setDrill(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
                      
                      // Show notification for add
                      setNotification({
                        show: true,
                        message: `New question added successfully`,
                        type: 'success'
                      });
                    }
                    setQuestionDraft({ ...emptyQuestion, choices: emptyQuestion.choices.map(() => ({ text: '', media: null })) });
                    setQuestionEditIdx(null);
                    
                    // Auto-hide notification after a few seconds
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                    
                    // Scroll back to questions list
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={
                    !questionDraft.text || 
                    (questionDraft.type === 'M' && questionDraft.choices.some(c => !c.text && !c.media)) ||
                    (questionDraft.type === 'F' && questionDraft.choices.some(c => !c.text)) ||
                    (questionDraft.type === 'D' && ((questionDraft.dragItems || []).length === 0 || (questionDraft.dropZones || []).length === 0))
                  }
                >
                  {questionEditIdx !== null ? 'Save' : 'Add'} Question
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={() => setStep(0)}>Back</button>
              {drill.questions.length < 3 && (
                <div className="text-xs text-red-500 mb-2">You must add at least 3 questions to continue.</div>
              )}
              <button
                className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition"
                onClick={() => setStep(2)}
                disabled={drill.questions.length < 3}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 text-center font-semibold animate-fadeIn">
                {successMsg}
              </div>
            )}
            <div className="mb-6">
              <div className="mb-2 font-medium">Title: <span className="font-normal">{drill.title}</span></div>
              <div className="mb-2 font-medium">Description: <span className="font-normal">{drill.description}</span></div>
              <div className="mb-2 font-medium">Open: <span className="font-normal">{drill.openDate}</span></div>
              <div className="mb-2 font-medium">Due: <span className="font-normal">{drill.dueDate}</span></div>
              <div className="mb-2 font-medium">Questions: <span className="font-normal">{drill.questions.length}</span></div>
            </div>
            <div className="mb-6">
              {drill.questions.map((q, idx) => (
                <div key={idx} className="mb-4 p-4 rounded-xl border-2 border-gray-100 bg-[#F7F9FC]">
                  <div className="font-medium mb-2">Q{idx+1}: {q.type === 'F'
                    ? <>
                        {(q.text || '').split('_')[0]}
                        <span className="inline-block w-16 border-b-2 border-gray-400 mx-2 align-middle" />
                        {(q.text || '').split('_')[1]}
                      </>
                    : q.text}
                  </div>
                  {q.type === 'M' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div
                          key={i}
                          className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}
                        >
                          {c.media ? (
                            (() => {
                              let src = null;
                              let type = '';
                              if (c.media instanceof File) {
                                src = URL.createObjectURL(c.media);
                                type = c.media.type;
                              } else if (c.media && c.media.url) {
                                src = c.media.url;
                                type = c.media.type || '';
                              }
                              if (type.startsWith('image/')) {
                                return (
                                  <img
                                    src={src}
                                    alt="preview"
                                    className="rounded w-full h-full object-contain border cursor-pointer"
                                    onClick={() => setMediaModal({ open: true, src, type })}
                                  />
                                );
                              } else if (type.startsWith('video/')) {
                                return (
                                  <video
                                    src={src}
                                    className="rounded w-full h-full object-contain border cursor-pointer"
                                    controls
                                    onClick={e => { e.stopPropagation(); setMediaModal({ open: true, src, type }); }}
                                  />
                                );
                              }
                              return null;
                            })()
                          ) : c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <i className="fa-regular fa-image text-lg text-gray-200"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.type === 'F' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(q.choices || []).map((c, i) => (
                        <div
                          key={i}
                          className={`w-32 h-24 px-1 py-1 rounded-lg border flex flex-col items-center justify-center ${q.answer === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-200 bg-white'}`}
                        >
                          {c.text ? (
                            <span className="text-center break-words w-full text-xs">{c.text}</span>
                          ) : (
                            <span className="text-gray-300 text-xs">No content</span>
                          )}
                        </div>
                      ))}
                      <div className="w-full text-xs text-gray-500 mt-2">
                        Correct: Choice {q.answer + 1}
                      </div>
                    </div>
                  )}
                  {q.type === 'D' && (
                    <div className="mt-2">
                      <div className="mb-2 font-semibold">Drag and Drop Mapping:</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium mb-1">Drag Items</div>
                          <ul className="space-y-1">
                            {(q.dragItems || []).map((item, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded">{item.text}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Drop Zones</div>
                          <ul className="space-y-1">
                            {(q.dropZones || []).map((zone, i) => (
                              <li key={i} className="px-2 py-1 bg-white border rounded flex items-center gap-2">
                                <span>{zone.text}</span>
                                {zone.correctItemIndex !== null && (q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex] && (
                                  <span className="ml-2 text-xs text-gray-500">→ {(q.dragItems || []).length > 0 && (q.dragItems || [])[zone.correctItemIndex].text}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105 transition" onClick={() => setStep(1)}>Back</button>
              <div className="flex gap-2">
                <button
                  className="px-6 py-2 rounded-xl bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-105 transition font-bold"
                  onClick={() => {
                    setSubmittingAction('draft');
                    handleSubmit('draft');
                  }}
                  disabled={submittingAction === 'draft'}
                >
                  {submittingAction === 'draft' ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : 'Save as Draft'}
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] hover:scale-105 transition font-bold"
                  onClick={() => {
                    setSubmittingAction('published');
                    handleSubmit('published');
                  }}
                  disabled={submittingAction === 'published'}
                >
                  {submittingAction === 'published' ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Publishing...
                    </>
                  ) : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDrill;
