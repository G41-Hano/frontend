import React from 'react';

const ClassroomHeader = ({ classroom, students, onEdit, onDelete, onBack }) => {
  return (
    <div className="bg-white rounded-3xl shadow-lg w-full max-w-[95%] mx-auto mb-6 p-8">
      <button
        className="text-[#4C53B4] flex items-center gap-2 text-base font-medium mb-4"
        onClick={onBack}
      >
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#4C53B4] flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-graduation-cap text-white text-2xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">{classroom?.name || ''}</h2>
            {classroom?.description && <p className="text-gray-600 mb-2">{classroom.description}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[#EEF1F5] px-4 py-2 rounded-xl flex items-center gap-2">
                <i className="fa-solid fa-key text-[#4C53B4]"></i>
                <span className="text-sm font-medium">
                  Class Code: <span className="font-mono text-[#4C53B4]">{classroom?.class_code || ''}</span>
                </span>
              </div>
              <span className="text-gray-500 flex items-center gap-2">
                <i className="fa-solid fa-users text-[#4C53B4]"></i>
                {students?.length || 0} {students?.length === 1 ? 'Student' : 'Students'}
              </span>
              <span className="text-gray-500 flex items-center gap-2">
                <i className="fa-solid fa-calendar text-[#4C53B4]"></i>
                Created {classroom?.created_at ? new Date(classroom.created_at).toLocaleDateString() : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto justify-end">
          <button
            className="flex-1 md:flex-initial px-6 py-3 text-base font-medium text-[#4C53B4] bg-[#EEF1F5] rounded-xl hover:bg-[#4C53B4] hover:text-white transition-all duration-300 flex items-center gap-2 justify-center"
            onClick={onEdit}
          >
            <i className="fa-solid fa-pen"></i>
            Edit
          </button>
          <button
            className="flex-1 md:flex-initial px-6 py-3 text-base font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 justify-center"
            onClick={onDelete}
          >
            <i className="fa-solid fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassroomHeader; 