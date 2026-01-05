import { useForm } from 'react-hook-form';
import type { Patient } from '../../types';

const genders = ['Male', 'Female', 'Other'] as const;
const cancerStages = ['Stage 0', 'Stage I', 'Stage II', 'Stage III', 'Stage IV', 'Unknown'] as const;
const receptorStatuses = ['Positive', 'Negative', 'Unknown'] as const;

type GenderOption = (typeof genders)[number] | '';
type CancerStageOption = (typeof cancerStages)[number] | '';
type ReceptorStatusOption = (typeof receptorStatuses)[number];

type PatientFormValues = {
  full_name: string;
  date_of_birth: string;
  gender: GenderOption;
  ethnicity: string;
  diagnosis_date: string;
  cancer_type: string;
  cancer_stage: CancerStageOption;
  tumor_size_cm: number | '';
  lymph_node_positive: boolean;
  er_status: ReceptorStatusOption;
  pr_status: ReceptorStatusOption;
  her2_status: ReceptorStatusOption;
  menopausal_status: string;
  initial_treatment_plan: string;
};

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>;
  onSubmit: (values: Partial<Patient>) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const baseDefaults: PatientFormValues = {
  full_name: '',
  date_of_birth: '',
  gender: '',
  ethnicity: '',
  diagnosis_date: '',
  cancer_type: '',
  cancer_stage: 'Unknown',
  tumor_size_cm: '',
  lymph_node_positive: false,
  er_status: 'Unknown',
  pr_status: 'Unknown',
  her2_status: 'Unknown',
  menopausal_status: '',
  initial_treatment_plan: ''
};

const fieldClasses =
  'w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition';

export default function PatientForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save Patient',
  loading = false
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PatientFormValues>({
    defaultValues: {
      ...baseDefaults,
      ...defaultValues
    }
  });

  const submitHandler = async (values: PatientFormValues) => {
    const payload: Partial<Patient> = {
      full_name: values.full_name.trim(),
      date_of_birth: values.date_of_birth,
      gender: values.gender as Patient['gender'],
      ethnicity: values.ethnicity.trim() || undefined,
      diagnosis_date: values.diagnosis_date,
      cancer_type: values.cancer_type.trim(),
      cancer_stage: (values.cancer_stage || 'Unknown') as Patient['cancer_stage'],
      tumor_size_cm: values.tumor_size_cm === '' || Number.isNaN(values.tumor_size_cm)
        ? undefined
        : Number(values.tumor_size_cm),
      lymph_node_positive: values.lymph_node_positive,
      er_status: values.er_status,
      pr_status: values.pr_status,
      her2_status: values.her2_status,
      menopausal_status: values.menopausal_status.trim() || undefined,
      initial_treatment_plan: values.initial_treatment_plan.trim() || undefined
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            {...register('full_name', { required: 'Full name is required' })}
            className={fieldClasses}
            placeholder="Jane Doe"
          />
          {errors.full_name && (
            <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            id="date_of_birth"
            type="date"
            {...register('date_of_birth', { required: 'Date of birth is required' })}
            className={fieldClasses}
          />
          {errors.date_of_birth && (
            <p className="text-sm text-red-600 mt-1">{errors.date_of_birth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            id="gender"
            {...register('gender', { required: 'Gender is required' })}
            className={fieldClasses}
          >
            <option value="">Select gender</option>
            {genders.map(gender => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-2">
            Ethnicity
          </label>
          <input
            id="ethnicity"
            type="text"
            {...register('ethnicity')}
            className={fieldClasses}
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="diagnosis_date" className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosis Date
          </label>
          <input
            id="diagnosis_date"
            type="date"
            {...register('diagnosis_date', { required: 'Diagnosis date is required' })}
            className={fieldClasses}
          />
          {errors.diagnosis_date && (
            <p className="text-sm text-red-600 mt-1">{errors.diagnosis_date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cancer_type" className="block text-sm font-medium text-gray-700 mb-2">
            Cancer Type
          </label>
          <input
            id="cancer_type"
            type="text"
            {...register('cancer_type', { required: 'Cancer type is required' })}
            className={fieldClasses}
            placeholder="Breast cancer"
          />
          {errors.cancer_type && (
            <p className="text-sm text-red-600 mt-1">{errors.cancer_type.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cancer_stage" className="block text-sm font-medium text-gray-700 mb-2">
            Cancer Stage
          </label>
          <select id="cancer_stage" {...register('cancer_stage')} className={fieldClasses}>
            {cancerStages.map(stage => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tumor_size_cm" className="block text-sm font-medium text-gray-700 mb-2">
            Tumor Size (cm)
          </label>
          <input
            id="tumor_size_cm"
            type="number"
            step="0.1"
            min="0"
            {...register('tumor_size_cm', {
              valueAsNumber: true,
              min: { value: 0, message: 'Tumor size must be 0 or greater' }
            })}
            className={fieldClasses}
            placeholder="Optional"
          />
          {errors.tumor_size_cm && (
            <p className="text-sm text-red-600 mt-1">{errors.tumor_size_cm.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lymph_node_positive" className="block text-sm font-medium text-gray-700 mb-2">
            Lymph Node Positive
          </label>
          <div className="flex items-center gap-2">
            <input
              id="lymph_node_positive"
              type="checkbox"
              {...register('lymph_node_positive')}
              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600">Positive lymph nodes detected</span>
          </div>
        </div>

        <div>
          <label htmlFor="er_status" className="block text-sm font-medium text-gray-700 mb-2">
            ER Status
          </label>
          <select id="er_status" {...register('er_status')} className={fieldClasses}>
            {receptorStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="pr_status" className="block text-sm font-medium text-gray-700 mb-2">
            PR Status
          </label>
          <select id="pr_status" {...register('pr_status')} className={fieldClasses}>
            {receptorStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="her2_status" className="block text-sm font-medium text-gray-700 mb-2">
            HER2 Status
          </label>
          <select id="her2_status" {...register('her2_status')} className={fieldClasses}>
            {receptorStatuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="menopausal_status" className="block text-sm font-medium text-gray-700 mb-2">
            Menopausal Status
          </label>
          <input
            id="menopausal_status"
            type="text"
            {...register('menopausal_status')}
            className={fieldClasses}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label htmlFor="initial_treatment_plan" className="block text-sm font-medium text-gray-700 mb-2">
          Initial Treatment Plan
        </label>
        <textarea
          id="initial_treatment_plan"
          rows={3}
          {...register('initial_treatment_plan')}
          className={fieldClasses}
          placeholder="Optional notes about the initial treatment plan"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export type { PatientFormValues };
