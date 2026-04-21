/** Parse montant saisi (virgule ou point). */
export function parseMoneyInput(raw: string | undefined): number | null {
  if (!raw?.trim()) {
    return null;
  }
  const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function validateCreateLoanDraft(values: {
  loan_kind: 'object' | 'money';
  person_name: string;
  item_name: string;
  amountInput: string;
  item_valueInput: string;
}): { ok: true } | { ok: false; message: string; field?: string } {
  if (!values.person_name.trim()) {
    return { ok: false, message: 'Indiquez la personne.', field: 'person_name' };
  }
  if (values.loan_kind === 'object') {
    if (!values.item_name.trim()) {
      return { ok: false, message: 'Indiquez le libellé de l’objet.', field: 'item_name' };
    }
    return { ok: true };
  }
  const amt = parseMoneyInput(values.amountInput);
  if (amt === null || amt <= 0) {
    return { ok: false, message: 'Indiquez un montant valide.', field: 'amountInput' };
  }
  return { ok: true };
}

export function parseOptionalMoneyInput(raw: string | undefined): number | null {
  if (!raw?.trim()) {
    return null;
  }
  return parseMoneyInput(raw);
}
