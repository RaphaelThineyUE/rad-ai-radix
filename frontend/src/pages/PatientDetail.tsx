import { useParams } from 'react-router-dom';

export default function PatientDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Patient Details
        </h2>
        <p className="text-gray-600">Patient ID: {id}</p>
      </div>
    </div>
  );
}
