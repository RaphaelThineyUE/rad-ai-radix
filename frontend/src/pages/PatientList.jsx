export default function PatientList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <button className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition">
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-12 text-gray-500">
          No patients yet. Add your first patient to get started.
        </div>
      </div>
    </div>
  );
}
