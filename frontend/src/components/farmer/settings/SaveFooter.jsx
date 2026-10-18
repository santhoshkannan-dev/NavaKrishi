const SaveFooter = ({
  onCancel,
  onSave,
  isSaving = false,
  disableSave = false,
  saveLabel = "Save Changes",
  cancelLabel = "Cancel",
}) => {
  return (
    <div className="fixed bottom-0 right-0 left-[270px] bg-white/90 backdrop-blur-md border-t border-gray-200 px-10 py-5 flex justify-end gap-5 z-50">

      <button
        type="button"
        onClick={onCancel}
        className="px-8 py-4 rounded-2xl hover:bg-gray-100 transition"
      >
        {cancelLabel}
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={disableSave || isSaving}
        className="bg-[#1f6d1a] hover:bg-[#165412] disabled:bg-[#7aa674] disabled:cursor-not-allowed text-white px-10 py-4 rounded-2xl font-semibold shadow-lg transition"
      >
        {isSaving ? "Saving..." : saveLabel}
      </button>
    </div>
  );
};

export default SaveFooter;