/**
 * Calculate the number of periods per year based on frequency
 */
export function getPeriodsPerYear(frequency: string): number {
  switch (frequency) {
    case 'hourly':
      return 8760; // 365 * 24
    case 'daily':
      return 365;
    case 'weekly':
      return 52;
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'yearly':
      return 1;
    default:
      return 12;
  }
}

/**
 * Calculate future value of SIP with compound interest
 * FV = P * [(1 + r)^n - 1] / r
 * Where:
 * P = periodic payment
 * r = periodic interest rate
 * n = number of periods
 */
export function calculateSIPFutureValue(
  periodicAmount: number,
  annualRate: number,
  periodsPerYear: number,
  totalPeriods: number
): number {
  const periodicRate = annualRate / 100 / periodsPerYear;
  const totalPeriodicPayments = totalPeriods;

  if (periodicRate === 0) {
    return periodicAmount * totalPeriodicPayments;
  }

  const futureValue = periodicAmount * ((Math.pow(1 + periodicRate, totalPeriodicPayments) - 1) / periodicRate);
  return futureValue;
}

/**
 * Calculate compound interest for FD
 * A = P * (1 + r/n)^(nt)
 * Where:
 * A = final amount
 * P = principal
 * r = annual interest rate (decimal)
 * n = number of times interest is compounded per year
 * t = time in years
 */
export function calculateFDMaturity(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 12
): number {
  const rate = annualRate / 100;
  const maturityAmount = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
  return maturityAmount;
}

/**
 * Calculate total interest for FD
 */
export function calculateFDInterest(principal: number, maturityAmount: number): number {
  return maturityAmount - principal;
}

/**
 * Calculate XIRR using Newton-Raphson method for loan cash flows
 * This is an approximation for irregular cash flows
 */
export function calculateXIRR(cashFlows: { amount: number; date: Date }[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;

  // Convert dates to days from first date
  const firstDate = cashFlows[0].date;
  const days = cashFlows.map(flow => {
    const diffTime = flow.date.getTime() - firstDate.getTime();
    return diffTime / (1000 * 60 * 60 * 24); // days
  });

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      const exponent = -rate * days[j] / 365; // assuming 365 days per year
      npv += cashFlows[j].amount * Math.pow(Math.E, exponent);
      dnpv += -days[j] / 365 * cashFlows[j].amount * Math.pow(Math.E, exponent);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // return as percentage
    }

    rate = rate - npv / dnpv;
  }

  return rate * 100; // return as percentage
}

/**
 * Calculate loan details from EMI, remaining installments, and remaining principal
 */
export function calculateLoanDetails(
  loanAmount: number,
  remainingInstallments: number,
  remainingPrincipal: number,
  emi: number
) {
  // Total interest paid so far
  const totalPaid = (loanAmount - remainingPrincipal);
  const totalInterestPaid = totalPaid - (loanAmount - remainingPrincipal);

  // Future cash flows for XIRR calculation
  const cashFlows = [
    { amount: -remainingPrincipal, date: new Date() } // Initial outflow (remaining principal)
  ];

  // Add EMI payments
  for (let i = 1; i <= remainingInstallments; i++) {
    const paymentDate = new Date();
    paymentDate.setMonth(paymentDate.getMonth() + i);
    cashFlows.push({ amount: emi, date: paymentDate });
  }

  // Calculate XIRR
  const xirr = calculateXIRR(cashFlows);

  // Calculate remaining time
  const remainingMonths = remainingInstallments;
  const remainingYears = remainingMonths / 12;

  return {
    totalInterestPaid,
    totalAmountPaid: totalPaid,
    remainingAmount: remainingPrincipal + (emi * remainingInstallments),
    xirr,
    remainingMonths,
    remainingYears
  };
}