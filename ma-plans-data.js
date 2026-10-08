export const MA_PLAN_YEAR = 2027;
export const MA_CARRIERS = Object.freeze(['Humana', 'Aetna', 'UnitedHealthcare', 'Devoted']);

const RX_OOP_2027 = '$2,400 / year Part D maximum';
const VERIFY = 'See SOB/EOC';
const varies = value => value || 'Varies by service area — see SOB/EOC';

const plan = (carrier, planNumber, planName, values = {}) => Object.freeze({
  carrier,
  plan_number: planNumber,
  plan_name: planName,
  premium: values.premium || VERIFY,
  medical_moop: values.medical_moop || VERIFY,
  rx_oop: values.part_d === false ? 'No Part D prescription drug coverage' : (values.rx_oop || RX_OOP_2027),
  dental: values.dental || VERIFY,
  vision: values.vision || VERIFY,
  hearing: values.hearing || VERIFY,
  inpatient: values.inpatient || VERIFY,
  otc_food_utilities: values.otc_food_utilities || VERIFY,
  transportation: values.transportation || VERIFY,
  source_note: values.source_note || '2027 Mississippi plan inventory; verify final benefits in carrier SOB/EOC.',
  sob_url: values.sob_url || '',
  eoc_url: values.eoc_url || ''
});

export const MA_PLANS_2027 = Object.freeze([
  // HUMANA — 2027 Mississippi inventory observed across current Mississippi county landscapes.
  plan('Humana','H5216-334','HumanaChoice - Diabetes and Heart (PPO C-SNP)',{premium:'$0 / month',medical_moop:'$6,800 in-network'}),
  plan('Humana','H7617-085','Humana Value Choice (PPO)',{premium:'$0 / month',medical_moop:'$6,000 in-network'}),
  plan('Humana','H5216-292','Humana Dual QMB Only (PPO D-SNP)',{premium:'$0 / month',medical_moop:VERIFY}),
  plan('Humana','H7617-083','Humana Dual Select H7617-083 (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H5216-367','HumanaChoice SNP-DE H5216-367 (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H5216-300','HumanaChoice H5216-300 (PPO)',{premium:'$0 / month',medical_moop:'$6,000 in-network'}),
  plan('Humana','R0110-003','Humana Full Access (Regional PPO)',{premium:'$212 / month',medical_moop:'$3,800 in-network'}),
  plan('Humana','H1036-222','Humana Dual QMB Only (HMO D-SNP)',{premium:'$0 / month'}),
  plan('Humana','H1036-329','Humana Dual Select H1036-329 (HMO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H1036-151','Humana Total Complete (HMO)',{premium:'$0 / month',medical_moop:'$5,500 in-network'}),
  plan('Humana','H1036-330','Humana Gold Plus Chronic Kidney Disease (HMO C-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H7617-087','Humana Value Plus H7617-087 (PPO)',{premium:'$6 / month',medical_moop:'$8,600 in-network'}),
  plan('Humana','H7617-084','HumanaChoice SNP-DE H7617-084 (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H7617-086','Humana USAA Honor Giveback (PPO)',{premium:'$0 / month',medical_moop:'$4,700 in-network',part_d:false}),
  plan('Humana','H5216-160','Humana Value Plus H5216-160 (PPO)',{premium:'$6 / month',medical_moop:'$8,600 in-network'}),
  plan('Humana','R0110-001','HumanaChoice R0110-001 (Regional PPO)',{premium:'$0 / month',medical_moop:'$9,000 in-network',part_d:false}),
  plan('Humana','H1036-328','Humana Gold Plus SNP-DE H1036-328 (HMO D-SNP)',{premium:'$0 / month'}),
  plan('Humana','H5216-298','Humana Dual Select H5216-298 (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H7617-082','Humana Dual QMB Only (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Humana','H5216-136','HumanaChoice H5216-136 (PPO)',{premium:'$43 / month',medical_moop:'$6,500 in-network'}),
  plan('Humana','H5216-097','HumanaChoice H5216-097 (PPO)',{premium:'$85 / month',medical_moop:'$9,100 in-network'}),
  plan('Humana','H1036-327','Humana Gold Plus H1036-327 (HMO)',{premium:'$0 / month',medical_moop:'$5,700 in-network'}),

  // AETNA — 2027 Mississippi inventory observed across current Mississippi county landscapes.
  plan('Aetna','H5521-477','Aetna Medicare Elite Giveback (PPO)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H5521-470','Aetna Medicare Value Plus (PPO)',{premium:'$24 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H5521-218','Aetna Medicare Signature Plus (PPO)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H5521-553','Aetna Medicare Signature Plus (PPO)',{premium:'$0 / month',medical_moop:'$9,850 in-network',hearing:'$500 hearing allowance per ear / year',inpatient:'$388 per day, days 1–7; $0 per day, days 8–90',otc_food_utilities:'$15 OTC allowance per quarter'}),
  plan('Aetna','H5521-324','Aetna Medicare Eagle Plus (PPO)',{premium:'$0 / month',medical_moop:'$9,250 in-network',part_d:false}),
  plan('Aetna','H5521-464','Aetna Medicare Dual Extra Care (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,250 in-network'}),
  plan('Aetna','H5521-465','Aetna Medicare Dual Care (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H3239-012','Aetna Medicare Dual Care (HMO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H3239-015','Aetna Medicare Dual Extra Care (HMO D-SNP)',{premium:'$0 / month'}),
  plan('Aetna','H3239-028','Aetna Medicare Full Dual Care (HMO D-SNP)',{premium:'$0 / month'}),
  plan('Aetna','H3239-017','Aetna Medicare Signature Care (HMO)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Aetna','H3239-005','Aetna Medicare Dual Extra (HMO D-SNP)',{premium:'$0 / month'}),

  // UNITEDHEALTHCARE — 2027 Mississippi inventory.
  plan('UnitedHealthcare','H1889-044','UHC Dual Complete MS-S3 (PPO D-SNP)',{premium:'$0 / month'}),
  plan('UnitedHealthcare','H5253-221','AARP Medicare Advantage Extras from UHC MS-7 (HMO-POS)',{premium:'$0 / month',medical_moop:'$7,150 in-network'}),
  plan('UnitedHealthcare','H5253-141','AARP Medicare Advantage Essentials from UHC MS-1 (HMO-POS)',{premium:'$0 / month',medical_moop:'$5,900 in-network'}),
  plan('UnitedHealthcare','H1889-043','UHC Dual Advantage MS-V2 (PPO D-SNP)',{premium:'$6 / month',medical_moop:'$6,400 in-network'}),
  plan('UnitedHealthcare','H5253-183','UHC Complete Care MS-6 (HMO-POS C-SNP)',{premium:'$0 / month',medical_moop:'$5,900 in-network'}),
  plan('UnitedHealthcare','H1889-045','UHC Dual Complete MS-Q1 (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),

  // DEVOTED — official 2027 Mississippi plan-document inventory.
  plan('Devoted','H7355-001','DEVOTED CHOICE 001 MS (PPO)',{premium:'$0 / month',medical_moop:'$5,400 in-network',dental:'$3,500 / year',vision:'$350 / year',otc_food_utilities:'$100 OTC / quarter; food or utility benefits may vary by eligibility/service area'}),
  plan('Devoted','H7355-002','DEVOTED CHOICE GIVEBACK 002 MS (PPO)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Devoted','H7355-003','DEVOTED DUAL CHOICE PLUS 003 MS (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Devoted','H7355-004','DEVOTED DUAL CHOICE 004 MS (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$5,900 in-network'}),
  plan('Devoted','H7355-006','DEVOTED C-SNP CHOICE 006 MS (PPO C-SNP)',{premium:'$0 / month',medical_moop:'$5,700 in-network',dental:'$3,500 / year',vision:'$350 / year',otc_food_utilities:'$120 OTC / quarter; Food & Home amount varies by service area'}),
  plan('Devoted','H7355-007','DEVOTED C-SNP CHOICE ENHANCED 007 MS (PPO C-SNP)',{premium:'$0 / month',medical_moop:'$5,900 in-network'}),
  plan('Devoted','H7355-009','DEVOTED DUAL CHOICE FULL 009 MS (PPO D-SNP)',{premium:'$0 / month',medical_moop:'$9,850 in-network'}),
  plan('Devoted','H7355-010','DEVOTED C-SNP CHOICE PLUS 010 MS (PPO C-SNP)',{premium:'$0 / month',dental:'$4,000 / year',vision:'$400 / year',otc_food_utilities:'$50 OTC / quarter; Food & Home amount varies by service area'}),
  plan('Devoted','H7355-011','DEVOTED C-SNP CHOICE GIVEBACK EXTRAS 011 MS (PPO C-SNP)',{premium:'$0 / month',medical_moop:'$7,500 in-network'}),
  plan('Devoted','H7355-012','DEVOTED CHOICE GIVEBACK EXTRAS 012 MS (PPO)',{premium:'$0 / month',medical_moop:'$7,500 in-network',dental:'$2,500 / year',vision:'$400 / year',otc_food_utilities:'$62 OTC / quarter'})
]);

export function plansByCarrier(carrier) {
  return MA_PLANS_2027.filter(plan => plan.carrier === carrier);
}
