import { MA_CARRIERS, MA_PLAN_YEAR, MA_PLANS_2027, plansByCarrier } from './ma-plans-data.js?v=ma-plans-1';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[c]));

const ROWS = Object.freeze([
  ['Plan price', 'premium'],
  ['Medical max out-of-pocket', 'medical_moop'],
  ['Prescription max out-of-pocket', 'rx_oop'],
  ['Dental allowance', 'dental'],
  ['Vision allowance', 'vision'],
  ['Hearing allowance', 'hearing'],
  ['Inpatient hospital stay', 'inpatient'],
  ['OTC / Food / Utilities', 'otc_food_utilities'],
  ['Transportation', 'transportation']
]);

export function createMAPlansFeature({ dialogs }) {
  let host = null;
  const selected = new Set();

  function selectedPlans() {
    return MA_PLANS_2027.filter(plan => selected.has(plan.plan_number));
  }

  function carrierMarkup(carrier) {
    const plans = plansByCarrier(carrier);
    return `
      <section class="ma-carrier-section" data-ma-carrier="${esc(carrier)}">
        <div class="ma-carrier-head">
          <h2>${esc(carrier)}</h2>
          <span>${plans.length} plan${plans.length === 1 ? '' : 's'}</span>
        </div>
        <div class="ma-plan-list">
          ${plans.map(plan => {
            const checked = selected.has(plan.plan_number);
            return `
              <label class="ma-plan-row${checked ? ' selected' : ''}">
                <input type="checkbox" data-ma-plan="${esc(plan.plan_number)}" ${checked ? 'checked' : ''} ${!checked && selected.size >= 5 ? 'disabled' : ''}>
                <span class="ma-plan-copy">
                  <strong>${esc(plan.plan_name)}</strong>
                  <small>${esc(plan.plan_number)}</small>
                </span>
              </label>`;
          }).join('')}
        </div>
      </section>`;
  }

  function pageMarkup() {
    return `
      <section class="ma-plans-page">
        <header class="ma-plans-intro">
          <div>
            <span class="eyebrow">Mississippi • ${MA_PLAN_YEAR}</span>
            <h2>Medicare Advantage Plans</h2>
            <p>Select up to 5 plans to compare benefits side by side.</p>
          </div>
          <div class="ma-plan-actions">
            <span data-ma-count>${selected.size} of 5 selected</span>
            <button type="button" class="btn secondary" data-ma-clear ${selected.size ? '' : 'disabled'}>Clear</button>
            <button type="button" class="btn primary" data-ma-compare ${selected.size ? '' : 'disabled'}>Compare Plans</button>
          </div>
        </header>
        <div class="ma-plan-note">
          <strong>2027 Mississippi reference.</strong>
          Benefits marked “See SOB/EOC” have not been entered from the official carrier document yet. Service-area and eligibility rules can change the benefit shown.
        </div>
        <div class="ma-carrier-grid">
          ${MA_CARRIERS.map(carrierMarkup).join('')}
        </div>
      </section>`;
  }

  function compareMarkup(plans) {
    return `
      <div class="ma-compare-wrap">
        <div class="ma-compare-scroll">
          <table class="ma-compare-table">
            <thead>
              <tr>
                <th>Benefit / Cost</th>
                ${plans.map(plan => `
                  <th>
                    <span>${esc(plan.carrier)}</span>
                    <strong>${esc(plan.plan_name)}</strong>
                    <small>${esc(plan.plan_number)}</small>
                  </th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${ROWS.map(([label, key]) => `
                <tr>
                  <th>${esc(label)}</th>
                  ${plans.map(plan => `<td>${esc(plan[key] || 'See SOB/EOC')}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="ma-compare-footnote">2027 Mississippi plans. Verify county/service area, Medicaid/LIS eligibility, and final benefit details in the carrier Summary of Benefits or Evidence of Coverage before enrollment.</p>
      </div>`;
  }

  function openComparison() {
    const plans = selectedPlans();
    if (!plans.length) return;
    dialogs.open({
      title: `Compare MA Plans (${plans.length})`,
      hint: '2027 Mississippi Medicare Advantage comparison',
      kind: 'ma-plan-compare-dialog',
      body: compareMarkup(plans)
    });
  }

  function bind() {
    if (!host?.isConnected) return;
    host.querySelectorAll('[data-ma-plan]').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.dataset.maPlan;
        if (input.checked) {
          if (selected.size >= 5 && !selected.has(id)) {
            input.checked = false;
            alert('You can compare up to 5 plans at a time.');
            return;
          }
          selected.add(id);
        } else {
          selected.delete(id);
        }
        render();
      });
    });
    host.querySelector('[data-ma-compare]')?.addEventListener('click', openComparison);
    host.querySelector('[data-ma-clear]')?.addEventListener('click', () => {
      selected.clear();
      render();
    });
  }

  function render() {
    if (!host?.isConnected) return;
    host.innerHTML = pageMarkup();
    bind();
  }

  return {
    mount(target) {
      host = target;
      render();
    },
    unmount() {
      host = null;
    },
    destroy() {
      host = null;
      selected.clear();
    }
  };
}
