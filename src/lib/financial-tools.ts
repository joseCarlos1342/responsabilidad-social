export type EmergencyFundInput = {
  essentialMonthlyExpense: number;
  targetMonths: number;
  possibleMonthlySavings: number;
};

function requireFiniteNonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} debe ser un número finito mayor o igual que cero.`);
  }
  return value;
}

export function calculateEmergencyFund(input: EmergencyFundInput) {
  const essentialMonthlyExpense = requireFiniteNonNegative(
    input.essentialMonthlyExpense,
    'El gasto mensual',
  );
  const targetMonths = requireFiniteNonNegative(input.targetMonths, 'La meta en meses');
  const possibleMonthlySavings = requireFiniteNonNegative(
    input.possibleMonthlySavings,
    'El ahorro mensual',
  );
  const targetFund = essentialMonthlyExpense * targetMonths;

  return {
    targetFund,
    monthsToTarget:
      targetFund > 0 && possibleMonthlySavings > 0
        ? Math.ceil(targetFund / possibleMonthlySavings)
        : null,
  };
}

export type CreditExample = {
  principal: number;
  monthlyRatePercent: number;
  termMonths: number;
  extraCosts: number;
};

export function calculateCreditComparison(example: CreditExample) {
  const principal = requireFiniteNonNegative(example.principal, 'El monto');
  const monthlyRatePercent = requireFiniteNonNegative(
    example.monthlyRatePercent,
    'La tasa mensual',
  );
  const termMonths = requireFiniteNonNegative(example.termMonths, 'El plazo');
  const extraCosts = requireFiniteNonNegative(example.extraCosts, 'Los costos adicionales');
  if (!Number.isInteger(termMonths) || termMonths === 0) {
    throw new RangeError('El plazo debe ser un número entero mayor que cero.');
  }

  const monthlyRate = monthlyRatePercent / 100;
  const installment = Math.round(
    monthlyRate === 0
      ? principal / termMonths
      : (principal * monthlyRate * (1 + monthlyRate) ** termMonths) /
          ((1 + monthlyRate) ** termMonths - 1),
  );

  return { installment, totalCost: installment * termMonths + extraCosts };
}

export function calculateCreditTotal(example: CreditExample) {
  return calculateCreditComparison(example).totalCost;
}

export const fraudChecklist = [
  '¿La entidad puede verificarse mediante un canal oficial?',
  '¿Te exigen dinero anticipado para desembolsar un crédito?',
  '¿Te presionan con urgencia?',
  '¿Solicitan claves o códigos?',
  '¿El enlace corresponde al dominio oficial?',
  '¿La oferta parece demasiado buena para ser cierta?',
  '¿Existe contrato e información clara?',
  '¿Puedes verificar la entidad ante organismos oficiales?',
] as const;
