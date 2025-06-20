/**
 * Israeli Salary Calculator with Tax Brackets
 * Calculates net salary, taxes, and deductions according to Israeli tax law
 */

// Israeli tax brackets for 2024 (amounts in NIS)
const ISRAELI_TAX_BRACKETS_2024 = [
    { min: 0, max: 6790, rate: 0.10, name: 'מדרגה ראשונה' },           // 10%
    { min: 6790, max: 9730, rate: 0.14, name: 'מדרגה שנייה' },          // 14%  
    { min: 9730, max: 15620, rate: 0.20, name: 'מדרגה שלישית' },        // 20%
    { min: 15620, max: 21709, rate: 0.31, name: 'מדרגה רביעית' },      // 31%
    { min: 21709, max: 45180, rate: 0.35, name: 'מדרגה חמישית' },       // 35%
    { min: 45180, max: 58510, rate: 0.47, name: 'מדרגה שישית' },        // 47%
    { min: 58510, max: Infinity, rate: 0.50, name: 'מדרגה שביעית' }     // 50%
];

// National Insurance (Bituach Leumi) rates for 2024
const BITUACH_LEUMI_RATES_2024 = {
    employee: {
        rate: 0.04,              // 4% 
        maxAmount: 6331,         // Maximum monthly amount
        ceiling: 158280          // Monthly salary ceiling (NIS)
    },
    employer: {
        rate: 0.0345,            // 3.45%
        maxAmount: 5460,         // Maximum monthly amount  
        ceiling: 158280          // Monthly salary ceiling (NIS)
    }
};

// Health Insurance rates for 2024
const HEALTH_INSURANCE_RATES_2024 = {
    rate: 0.031,                 // 3.1%
    additionalRate: 0.05,        // 5% for high earners
    threshold: 6331,             // Monthly threshold for additional rate
    ceiling: 158280              // Monthly salary ceiling (NIS)
};

// Personal tax credits for 2024 (monthly amounts)
const TAX_CREDITS_2024 = {
    basic: 2320,                 // Basic personal credit
    married: 2320,               // Married credit (additional)
    child: 2320,                 // Credit per child under 18
    student: 1160,               // Student credit
    oleh: 2320,                  // New immigrant credit (7 years)
    disabled: 2900               // Disabled person credit
};

export class IsraeliSalaryCalculator {
    constructor() {
        this.taxBrackets = ISRAELI_TAX_BRACKETS_2024;
        this.bituachLeumiRates = BITUACH_LEUMI_RATES_2024;
        this.healthInsuranceRates = HEALTH_INSURANCE_RATES_2024;
        this.taxCredits = TAX_CREDITS_2024;
    }

    // Calculate monthly net salary from gross
    calculateMonthlySalary(grossMonthly, options = {}) {
        const {
            maritalStatus = 'single',      // 'single', 'married'
            children = 0,                  // Number of children under 18
            isStudent = false,             // Student status
            isOleh = false,               // New immigrant status (first 7 years)
            isDisabled = false,           // Disabled status
            pensionContribution = 0.06,   // Pension contribution rate (6% default)
            hasCompanyCar = false,        // Company car benefit
            companyCarValue = 0           // Monthly company car value for tax
        } = options;

        const calculations = {
            gross: grossMonthly,
            deductions: {},
            taxes: {},
            credits: {},
            net: 0,
            breakdown: []
        };

        // Step 1: Calculate pension contribution (before tax)
        const pensionDeduction = grossMonthly * pensionContribution;
        calculations.deductions.pension = pensionDeduction;
        const pensionableIncome = grossMonthly - pensionDeduction;

        // Step 2: Add company car benefit to taxable income
        let taxableIncome = pensionableIncome;
        if (hasCompanyCar && companyCarValue > 0) {
            taxableIncome += companyCarValue;
            calculations.deductions.companyCarTax = companyCarValue;
        }

        // Step 3: Calculate income tax
        const incomeTax = this.calculateIncomeTax(taxableIncome);
        calculations.taxes.income = incomeTax.total;
        calculations.breakdown.push(...incomeTax.breakdown);

        // Step 4: Calculate tax credits
        const totalCredits = this.calculateTaxCredits(maritalStatus, children, isStudent, isOleh, isDisabled);
        calculations.credits = totalCredits;

        // Step 5: Calculate National Insurance (Bituach Leumi)
        const bituachLeumi = this.calculateBituachLeumi(grossMonthly);
        calculations.taxes.bituachLeumi = bituachLeumi;

        // Step 6: Calculate Health Insurance  
        const healthInsurance = this.calculateHealthInsurance(grossMonthly);
        calculations.taxes.healthInsurance = healthInsurance;

        // Step 7: Calculate net income tax after credits
        const netIncomeTax = Math.max(0, incomeTax.total - totalCredits.total);
        calculations.taxes.netIncome = netIncomeTax;

        // Step 8: Calculate total deductions
        const totalTaxes = netIncomeTax + bituachLeumi + healthInsurance;
        const totalDeductions = pensionDeduction + totalTaxes;

        // Step 9: Calculate net salary
        calculations.net = grossMonthly - totalDeductions;
        calculations.totalTaxes = totalTaxes;
        calculations.totalDeductions = totalDeductions;
        calculations.effectiveTaxRate = (totalTaxes / grossMonthly) * 100;

        return calculations;
    }

    // Calculate annual salary breakdown
    calculateAnnualSalary(grossAnnual, options = {}) {
        const grossMonthly = grossAnnual / 12;
        const monthly = this.calculateMonthlySalary(grossMonthly, options);
        
        return {
            annual: {
                gross: grossAnnual,
                net: monthly.net * 12,
                totalTaxes: monthly.totalTaxes * 12,
                totalDeductions: monthly.totalDeductions * 12,
                effectiveTaxRate: monthly.effectiveTaxRate
            },
            monthly: monthly,
            breakdown: monthly.breakdown
        };
    }

    // Calculate income tax based on brackets
    calculateIncomeTax(monthlyIncome) {
        let remainingIncome = monthlyIncome;
        let totalTax = 0;
        const breakdown = [];

        for (const bracket of this.taxBrackets) {
            if (remainingIncome <= 0) break;

            const taxableInThisBracket = Math.min(
                remainingIncome, 
                bracket.max - bracket.min
            );

            if (taxableInThisBracket > 0) {
                const taxInBracket = taxableInThisBracket * bracket.rate;
                totalTax += taxInBracket;
                
                breakdown.push({
                    bracket: bracket.name,
                    rate: `${(bracket.rate * 100).toFixed(1)}%`,
                    taxableAmount: taxableInThisBracket,
                    tax: taxInBracket,
                    range: `${formatCurrency(bracket.min)} - ${bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}`
                });

                remainingIncome -= taxableInThisBracket;
            }
        }

        return {
            total: totalTax,
            breakdown: breakdown
        };
    }

    // Calculate tax credits
    calculateTaxCredits(maritalStatus, children, isStudent, isOleh, isDisabled) {
        const credits = {
            basic: this.taxCredits.basic,
            married: maritalStatus === 'married' ? this.taxCredits.married : 0,
            children: children * this.taxCredits.child,
            student: isStudent ? this.taxCredits.student : 0,
            oleh: isOleh ? this.taxCredits.oleh : 0,
            disabled: isDisabled ? this.taxCredits.disabled : 0
        };

        credits.total = Object.values(credits).reduce((sum, credit) => sum + credit, 0);
        
        return credits;
    }

    // Calculate National Insurance (Bituach Leumi)
    calculateBituachLeumi(grossMonthly) {
        const cappedIncome = Math.min(grossMonthly, this.bituachLeumiRates.employee.ceiling);
        const bituachLeumi = cappedIncome * this.bituachLeumiRates.employee.rate;
        return Math.min(bituachLeumi, this.bituachLeumiRates.employee.maxAmount);
    }

    // Calculate Health Insurance
    calculateHealthInsurance(grossMonthly) {
        const cappedIncome = Math.min(grossMonthly, this.healthInsuranceRates.ceiling);
        let healthInsurance = cappedIncome * this.healthInsuranceRates.rate;
        
        // Additional rate for high earners
        if (grossMonthly > this.healthInsuranceRates.threshold) {
            const additionalIncome = Math.min(
                grossMonthly - this.healthInsuranceRates.threshold,
                this.healthInsuranceRates.ceiling - this.healthInsuranceRates.threshold
            );
            healthInsurance += additionalIncome * this.healthInsuranceRates.additionalRate;
        }
        
        return healthInsurance;
    }

    // Calculate required gross salary to achieve target net
    calculateRequiredGross(targetNet, options = {}) {
        // Binary search to find required gross
        let low = targetNet;
        let high = targetNet * 2;
        let tolerance = 1; // NIS
        
        while (high - low > tolerance) {
            const mid = (low + high) / 2;
            const calculation = this.calculateMonthlySalary(mid, options);
            
            if (calculation.net < targetNet) {
                low = mid;
            } else {
                high = mid;
            }
        }
        
        const requiredGross = (low + high) / 2;
        const verification = this.calculateMonthlySalary(requiredGross, options);
        
        return {
            requiredGross: requiredGross,
            actualNet: verification.net,
            difference: verification.net - targetNet,
            calculation: verification
        };
    }

    // Get salary comparison (multiple scenarios)
    compareSalaries(salaries, options = {}) {
        return salaries.map(salary => ({
            gross: salary,
            calculation: this.calculateMonthlySalary(salary, options)
        }));
    }

    // Get optimal salary ranges for different net targets
    getOptimalRanges(netTargets, options = {}) {
        return netTargets.map(target => {
            const result = this.calculateRequiredGross(target, options);
            return {
                targetNet: target,
                requiredGross: result.requiredGross,
                actualNet: result.actualNet,
                effectiveTaxRate: result.calculation.effectiveTaxRate,
                monthlyTaxes: result.calculation.totalTaxes
            };
        });
    }

    // Format salary breakdown for display
    formatSalaryBreakdown(calculation, options = {}) {
        const { showDetailed = true, currency = true } = options;
        
        const format = currency ? formatCurrency : (x) => formatNumber(x, { precision: 0 });
        
        const summary = {
            'שכר ברוטו': format(calculation.gross),
            'ניכויי פנסיה': format(calculation.deductions.pension || 0),
            'מס הכנסה': format(calculation.taxes.netIncome || 0),
            'ביטוח לאומי': format(calculation.taxes.bituachLeumi || 0),
            'ביטוח בריאות': format(calculation.taxes.healthInsurance || 0),
            'סה"כ ניכויים': format(calculation.totalDeductions || 0),
            'שכר נטו': format(calculation.net),
            'שיעור מס אפקטיבי': `${calculation.effectiveTaxRate?.toFixed(1)}%`
        };

        if (showDetailed && calculation.breakdown) {
            summary.breakdown = calculation.breakdown;
        }

        if (calculation.credits) {
            summary.credits = calculation.credits;
        }

        return summary;
    }
}

// Helper functions for formatting (assuming global formatters exist)
function formatCurrency(amount) {
    return window.formatCurrency ? window.formatCurrency(amount) : `₪${amount.toLocaleString()}`;
}

function formatNumber(number, options = {}) {
    return window.formatNumber ? window.formatNumber(number) : number.toLocaleString();
}

// Create global instance
window.IsraeliSalaryCalculator = IsraeliSalaryCalculator;
window.salaryCalculator = new IsraeliSalaryCalculator();

// Global helper functions
window.calculateMonthlySalary = (gross, options) => window.salaryCalculator.calculateMonthlySalary(gross, options);
window.calculateAnnualSalary = (gross, options) => window.salaryCalculator.calculateAnnualSalary(gross, options);
window.calculateRequiredGross = (targetNet, options) => window.salaryCalculator.calculateRequiredGross(targetNet, options);

console.log('💰 Israeli Salary Calculator loaded successfully');

export default IsraeliSalaryCalculator;