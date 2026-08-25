export interface AIExplanationItem {
  parameter: string;
  value: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  explanation: string;
}

export interface AISummaryResult {
  summary: string;
  items: AIExplanationItem[];
  recommendation: string;
}

const reportTemplates: Record<string, AISummaryResult> = {
  'CBC Blood Test': {
    summary:
      'Your Complete Blood Count shows a slightly low hemoglobin level, which may indicate mild anemia. All other parameters are within normal range. Consider consulting your doctor about dietary adjustments.',
    items: [
      { parameter: 'Hemoglobin', value: '10.2 g/dL', status: 'low', explanation: 'Below the normal range of 12-16 g/dL. May indicate mild anemia. Iron-rich foods like spinach, lentils, and red meat can help.' },
      { parameter: 'White Blood Cells', value: '6.8 K/uL', status: 'normal', explanation: 'Within the normal range of 4-11 K/uL. Your immune system appears healthy.' },
      { parameter: 'Platelets', value: '245 K/uL', status: 'normal', explanation: 'Within the normal range of 150-450 K/uL. Blood clotting function is normal.' },
      { parameter: 'Red Blood Cells', value: '4.2 M/uL', status: 'normal', explanation: 'Within the normal range. Oxygen-carrying capacity is adequate.' },
    ],
    recommendation: 'Include iron-rich foods in your diet and consult your doctor about whether an iron supplement is needed. A follow-up CBC in 3 months is recommended.',
  },
  'Blood Pressure': {
    summary:
      'Your blood pressure reading of 150/95 mmHg is above the normal range, classifying as Stage 1 Hypertension. Regular monitoring and lifestyle adjustments are recommended.',
    items: [
      { parameter: 'Systolic', value: '150 mmHg', status: 'high', explanation: 'Above the normal range of 90-120 mmHg. Elevated systolic pressure increases cardiovascular risk over time.' },
      { parameter: 'Diastolic', value: '95 mmHg', status: 'high', explanation: 'Above the normal range of 60-80 mmHg. Consistent elevation should be discussed with your doctor.' },
      { parameter: 'Pulse Rate', value: '78 bpm', status: 'normal', explanation: 'Within the normal resting range of 60-100 bpm.' },
    ],
    recommendation: 'Reduce sodium intake, engage in regular aerobic exercise, and consult your doctor about BP medication review. Monitor blood pressure twice daily.',
  },
  'Blood Sugar': {
    summary:
      'Your fasting blood sugar of 92 mg/dL is within the normal range. Continue maintaining a balanced diet and regular physical activity.',
    items: [
      { parameter: 'Fasting Glucose', value: '92 mg/dL', status: 'normal', explanation: 'Within the normal range of 70-99 mg/dL. Your blood sugar control appears good.' },
      { parameter: 'HbA1c', value: '5.4%', status: 'normal', explanation: 'Within the normal range of 4-5.6%. This reflects good average blood sugar over the past 3 months.' },
    ],
    recommendation: 'Continue your current diet and exercise routine. Annual screening is recommended for continued monitoring.',
  },
  'Lipid Profile': {
    summary:
      'Your lipid profile shows slightly elevated LDL (bad cholesterol). HDL (good cholesterol) is at a healthy level. Dietary modifications are recommended.',
    items: [
      { parameter: 'Total Cholesterol', value: '195 mg/dL', status: 'normal', explanation: 'Below the borderline of 200 mg/dL. Overall cholesterol level is acceptable.' },
      { parameter: 'LDL', value: '135 mg/dL', status: 'high', explanation: 'Above the optimal range of <100 mg/dL. This is the "bad" cholesterol that can build up in arteries.' },
      { parameter: 'HDL', value: '55 mg/dL', status: 'normal', explanation: 'Within the protective range of >40 mg/dL for men, >50 for women. Helps remove cholesterol from arteries.' },
      { parameter: 'Triglycerides', value: '140 mg/dL', status: 'normal', explanation: 'Within the normal range of <150 mg/dL.' },
    ],
    recommendation: 'Reduce saturated fat intake, increase fiber-rich foods, and consider regular cardiovascular exercise. Recheck lipid profile in 6 months.',
  },
  'Thyroid Panel': {
    summary:
      'Your thyroid function tests are within normal range. No signs of hypo- or hyperthyroidism detected.',
    items: [
      { parameter: 'TSH', value: '2.1 mIU/L', status: 'normal', explanation: 'Within the normal range of 0.4-4.0 mIU/L. Thyroid stimulating hormone is at a healthy level.' },
      { parameter: 'Free T4', value: '1.2 ng/dL', status: 'normal', explanation: 'Within the normal range of 0.8-1.8 ng/dL. Active thyroid hormone level is normal.' },
      { parameter: 'Free T3', value: '3.1 pg/mL', status: 'normal', explanation: 'Within the normal range of 2.3-4.2 pg/mL.' },
    ],
    recommendation: 'Your thyroid function is normal. No action needed unless symptoms develop. Routine screening every 1-2 years is sufficient.',
  },
  default: {
    summary:
      'Your report has been analyzed. Most values are within expected ranges. A detailed breakdown is provided below for your understanding.',
    items: [
      { parameter: 'Overall Assessment', value: 'Stable', status: 'normal', explanation: 'Your results are generally within normal limits. No critical values detected.' },
      { parameter: 'Areas to Monitor', value: 'None critical', status: 'normal', explanation: 'No parameters require immediate attention. Continue routine health monitoring.' },
    ],
    recommendation: 'Maintain regular health check-ups and share this report with your doctor during your next visit for personalized advice.',
  },
};

export function generateAISummary(reportTitle: string, reportType?: string): AISummaryResult {
  const key = reportTemplates[reportTitle] ? reportTitle : reportType && reportTemplates[reportType] ? reportType : 'default';
  return reportTemplates[key];
}

export function evaluateVital(
  type: string,
  value: string,
  secondaryValue?: string,
): { status: 'normal' | 'high' | 'low' | 'critical'; note: string } {
  if (type === 'blood_pressure') {
    const sys = parseInt(value);
    const dia = parseInt(secondaryValue ?? '0');
    if (sys >= 180 || dia >= 120) return { status: 'critical', note: 'Hypertensive crisis — seek immediate medical attention.' };
    if (sys >= 140 || dia >= 90) return { status: 'high', note: 'Stage 2 hypertension. Consult your doctor promptly.' };
    if (sys >= 130 || dia >= 80) return { status: 'high', note: 'Stage 1 hypertension. Monitor regularly and consider lifestyle changes.' };
    if (sys < 90 || dia < 60) return { status: 'low', note: 'Low blood pressure. Stay hydrated and rise slowly from sitting.' };
    return { status: 'normal', note: 'Blood pressure is within the healthy range.' };
  }
  if (type === 'blood_sugar') {
    const v = parseInt(value);
    if (v >= 300) return { status: 'critical', note: 'Very high blood sugar — seek immediate medical care.' };
    if (v >= 126) return { status: 'high', note: 'Diabetic range. Consult your doctor for management plan.' };
    if (v >= 100) return { status: 'high', note: 'Pre-diabetic range. Dietary adjustments recommended.' };
    if (v < 70) return { status: 'low', note: 'Low blood sugar. Consume fast-acting carbohydrates.' };
    return { status: 'normal', note: 'Blood sugar is within the normal fasting range.' };
  }
  if (type === 'heart_rate') {
    const v = parseInt(value);
    if (v > 120) return { status: 'high', note: 'Elevated heart rate. Rest and recheck; consult doctor if persistent.' };
    if (v < 50) return { status: 'low', note: 'Low resting heart rate. If symptomatic, consult your doctor.' };
    return { status: 'normal', note: 'Heart rate is within the normal resting range.' };
  }
  if (type === 'spo2') {
    const v = parseInt(value);
    if (v < 90) return { status: 'critical', note: ' critically low oxygen saturation — seek emergency care.' };
    if (v < 95) return { status: 'low', note: 'Below normal oxygen level. Monitor closely and consult doctor.' };
    return { status: 'normal', note: 'Oxygen saturation is within the normal range.' };
  }
  if (type === 'temperature') {
    const v = parseFloat(value);
    if (v >= 39.5) return { status: 'critical', note: 'High fever — seek medical attention promptly.' };
    if (v >= 38) return { status: 'high', note: 'Fever detected. Rest, hydrate, and monitor.' };
    if (v < 35) return { status: 'low', note: 'Below normal body temperature. Warm up and recheck.' };
    return { status: 'normal', note: 'Body temperature is normal.' };
  }
  return { status: 'normal', note: 'Reading recorded.' };
}

export const vitalLabels: Record<string, string> = {
  blood_pressure: 'Blood Pressure',
  blood_sugar: 'Blood Sugar',
  heart_rate: 'Heart Rate',
  temperature: 'Temperature',
  spo2: 'Oxygen Saturation',
  weight: 'Weight',
};

export const vitalUnits: Record<string, string> = {
  blood_pressure: 'mmHg',
  blood_sugar: 'mg/dL',
  heart_rate: 'bpm',
  temperature: '°C',
  spo2: '%',
  weight: 'kg',
};
