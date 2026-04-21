export type LoanMode = 'lent' | 'borrowed';
export type LoanStatus = 'open' | 'returned';
/** Objet = bien physique ; Argent = montant en euros. */
export type LoanKind = 'object' | 'money';

export type LoanRow = {
  id: string;
  user_id: string;
  mode: LoanMode;
  loan_kind: LoanKind;
  person_name: string;
  /** Objet : libellé ; Argent : souvent null côté UI. */
  item_name: string | null;
  /** Montant du prêt en euros (réservé au type Argent). */
  amount: number | null;
  /** Valeur estimée d’un objet (optionnel). */
  item_value: number | null;
  note: string | null;
  created_at: string;
  /** Date du prêt (jour calendaire). */
  loan_date: string;
  /** Date de retour souhaitée (optionnelle). */
  expected_return_date: string | null;
  /** Ancien rappel ; conservé pour compatibilité. */
  reminder_at: string | null;
  status: LoanStatus;
  returned_at: string | null;
};

export type HomeStats = {
  owedToMeTotalEur: number;
  openLoansCount: number;
  toReturnTotalEur: number;
};

export type CreateLoanPayload = {
  mode: LoanMode;
  loan_kind: LoanKind;
  person_name: string;
  item_name: string | null;
  amount: number | null;
  item_value: number | null;
  loan_date: string;
  expected_return_date: string | null;
  note: string | null;
  status: LoanStatus;
};
