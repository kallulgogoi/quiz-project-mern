import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, HelpCircle } from "lucide-react";

export default function QuestionForm({
  initialData,
  onSave,
  onCancel,
  loading,
}) {
  const [formData, setFormData] = useState({
    questionText: "",
    questionType: "mcq",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    correctAnswers: [],
    points: 1,
    timeLimit: 30,
    explanation: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        options: initialData.options?.length
          ? initialData.options
          : [{ text: "", isCorrect: false }],
        correctAnswers: initialData.correctAnswers || [],
      });
    }
  }, [initialData]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectSelection = (index) => {
    const newOptions = [...formData.options];

    if (formData.questionType === "mcq") {
      newOptions.forEach((opt) => (opt.isCorrect = false));
      newOptions[index].isCorrect = true;
    } else {
      newOptions[index].isCorrect = !newOptions[index].isCorrect;
    }

    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    if (formData.options.length >= 6) return;
    setFormData({
      ...formData,
      options: [...formData.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.questionType !== "fill-blank") {
      const hasCorrect = formData.options.some((o) => o.isCorrect);
      if (!hasCorrect) return alert("Please mark at least one correct option");
    } else if (
      formData.correctAnswers.length === 0 ||
      !formData.correctAnswers[0]
    ) {
      return alert("Please provide the correct answer");
    }

    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-6 rounded-xl border border-gray-200"
    >
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Question Text
          </label>
          <input
            required
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. What is the capital of France?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={formData.questionType}
            onChange={(e) =>
              setFormData({ ...formData, questionType: e.target.value })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="mcq">Single Choice (MCQ)</option>
            <option value="multiple-correct">Multiple Correct</option>
            <option value="fill-blank">Fill in the Blank</option>
          </select>
        </div>
      </div>

      {/* Options Section */}
      {formData.questionType !== "fill-blank" ? (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Options (Check the correct answer)
          </label>
          <div className="space-y-3">
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCorrectSelection(idx)}
                  className={`p-2 rounded-full border ${
                    opt.isCorrect
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white border-gray-300 text-gray-300 hover:border-green-300"
                  }`}
                >
                  <Check size={16} />
                </button>
                <input
                  required
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className={`flex-1 p-2 border rounded outline-none focus:border-blue-500 ${
                    opt.isCorrect ? "bg-green-50 border-green-200" : ""
                  }`}
                  placeholder={`Option ${idx + 1}`}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {formData.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> Add Option
            </button>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Correct Answer
          </label>
          <input
            required
            value={formData.correctAnswers[0] || ""}
            onChange={(e) =>
              setFormData({ ...formData, correctAnswers: [e.target.value] })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none border-green-200 bg-green-50"
            placeholder="Enter the exact answer"
          />
        </div>
      )}

      {/* Settings Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Points
          </label>
          <input
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: parseInt(e.target.value) })
            }
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        {/* <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Time (sec)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={formData.timeLimit}
            onChange={(e) =>
              setFormData({ ...formData, timeLimit: parseInt(e.target.value) })
            }
            className="w-full p-2 border rounded text-sm"
          />
        </div> */}
        <div className="col-span-2 flex items-end gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Question"}
          </button>
        </div>
      </div>
    </form>
  );
}
