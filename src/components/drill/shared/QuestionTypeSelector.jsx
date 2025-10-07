const QuestionTypeSelector = ({ 
  selectedType, 
  onTypeChange 
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium"> Drill Type <span className="text-red-500">*</span></label>
      <select
        className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
        value={selectedType}
        onChange={e => {
          const newType = e.target.value;
          onTypeChange(newType);
        }}
      >
        <option value="M">Smart Select</option>
        <option value="F">Blank Busters</option>
        <option value="D">Sentence Builder</option>
        <option value="G">Memory Game</option>
        <option value="P">Four Pics One Word</option>
      </select>

      {/* Preview Text and Popover */}
      <div className="mt-2 flex items-center gap-2 text-sm text-[#4C53B4]">
        <div className="relative group">
          <div className="flex items-center gap-1 cursor-help">
            <i className="fa-solid fa-circle-info"></i>
            <span>Hover to preview question</span>
          </div>

          {/* Popover Content */}
          <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 absolute left-0 top-full mt-2 w-[400px] bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
            <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium text-[#4C53B4]">
                  {selectedType === 'M' ? 'Smart Select' :
                   selectedType === 'F' ? 'Blank Busters' :
                   selectedType === 'D' ? 'Sentence Builder' :
                   selectedType === 'G' ? 'Memory Game' :
                   'Four Pics One Word'} Preview
                </div>
                <div className="text-xs text-gray-500">How students will see it</div>
              </div>

              {/* Smart Select Preview */}
              {selectedType === 'M' && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Choose the correct answer:</div>
                  <div className="text-sm text-gray-700 mb-2">What is the definition of "backpack"?</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg border-2 border-[#4C53B4] bg-[#FFF] text-[#4C53B4] cursor-pointer text-sm">
                      A bag carried on your back for holding books and supplies
                    </div>
                    <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                      A type of shoe worn for hiking
                    </div>
                    <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                      A small pocket in front of pants
                    </div>
                    <div className="p-3 rounded-lg border-2 border-gray-200 hover:border-[#4C53B4] hover:bg-[#EEF1F5] cursor-pointer text-sm">
                      A strap used to secure items
                    </div>
                  </div>
                </div>
              )}

              {/* Blank Busters Preview */}
              {selectedType === 'F' && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Fill in the missing letters:</div>
                  <div className="flex items-center justify-center gap-1">
                    {['B','_','_','K','P','_','C','K'].map((letter, i) => (
                      <div 
                        key={`letter-${i}-${letter}`}
                        className={`w-8 h-8 flex items-center justify-center rounded ${
                          letter === '_' 
                            ? 'bg-[#EEF1F5] text-[#4C53B4]' 
                            : 'bg-[#4C53B4] text-white'
                        } font-bold text-lg`}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {['A', 'E', 'C', 'O', 'A'].map((letter, i) => (
                      <div 
                        key={`choice-${i}-${letter}`}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white border-2 border-[#4C53B4] text-[#4C53B4] cursor-pointer hover:bg-[#EEF1F5] font-bold text-lg"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
                    <i className="fa-solid fa-lightbulb text-yellow-500 mr-1"></i>
                    Hint: Something you carry on your back
                  </div>
                </div>
              )}

              {/* Drag and Drop Preview */}
              {selectedType === 'D' && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Fill in the blanks:</div>
                  <div className="p-4 bg-[#F7F9FC] rounded-lg text-sm">
                    A <span className="inline-block w-24 border-b-2 border-[#4C53B4] mx-1"></span> is worn on your 
                    <span className="inline-block w-24 border-b-2 border-[#4C53B4] mx-1"></span>.
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                      backpack
                    </div>
                    <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                      back
                    </div>
                    <div className="px-3 py-1 bg-white border-2 border-[#4C53B4] rounded text-sm text-[#4C53B4] cursor-move hover:bg-[#EEF1F5]">
                      shoulders
                    </div>
                  </div>
                </div>
              )}

              {/* Memory Game Preview */}
              {selectedType === 'G' && (
                <div className="space-y-3">
                  <div className="text-sm font-medium">Match the pairs:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-[#4C53B4] rounded-lg flex items-center justify-center text-white p-2 cursor-pointer hover:bg-[#3a4095] transition-colors">
                      <img 
                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop" 
                        alt="Backpack"
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="aspect-square bg-[#4C53B4] rounded-lg flex items-center justify-center text-white p-2 cursor-pointer hover:bg-[#3a4095] transition-colors">
                      <div className="text-sm text-center">A bag carried on the back, used to carry books and supplies</div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    Click cards to find matching pairs
                  </div>
                </div>
              )}

              {/* Four Pics One Word Preview */}
              {selectedType === 'P' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=150&h=150&fit=crop" 
                        alt="School backpack"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop" 
                        alt="Backpack front view"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=150&h=150&fit=crop" 
                        alt="Hiking backpack"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=150&h=150&fit=crop" 
                        alt="Student wearing backpack"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-center font-bold text-xl text-[#4C53B4]">
                    BACKPACK
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                <i className="fa-solid fa-circle-info mr-1"></i>
                This is just a preview. You can customize all content when creating your question.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;