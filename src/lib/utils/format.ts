/**
 * DecimalMoney: Decimal-safe currency calculation utility.
 * Operates on integer cents to avoid IEEE-754 floating-point inaccuracies.
 * Mirrors the enterprise financial rules implemented in the Flutter and NestJS backends.
 */
export class DecimalMoney {
  private readonly cents: number;

  constructor(cents: number = 0) {
    this.cents = Math.round(cents);
  }

  static fromDecimal(amount: number): DecimalMoney {
    return new DecimalMoney(Math.round(amount * 100));
  }

  static fromCents(cents: number): DecimalMoney {
    return new DecimalMoney(cents);
  }

  static zero(): DecimalMoney {
    return new DecimalMoney(0);
  }

  get amount(): number {
    return this.cents / 100;
  }

  get inCents(): number {
    return this.cents;
  }

  add(other: DecimalMoney | number): DecimalMoney {
    const otherCents = other instanceof DecimalMoney ? other.cents : Math.round(other * 100);
    return new DecimalMoney(this.cents + otherCents);
  }

  subtract(other: DecimalMoney | number): DecimalMoney {
    const otherCents = other instanceof DecimalMoney ? other.cents : Math.round(other * 100);
    return new DecimalMoney(this.cents - otherCents);
  }

  multiply(factor: number): DecimalMoney {
    return new DecimalMoney(Math.round(this.cents * factor));
  }

  format(currency: string = '$'): string {
    const absVal = Math.abs(this.amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return this.cents < 0 ? `-${currency}${absVal}` : `${currency}${absVal}`;
  }

  toString(): string {
    return this.format('$');
  }
}

export function formatCurrency(amount: number | DecimalMoney, currency: string = '$'): string {
  if (amount instanceof DecimalMoney) {
    return amount.format(currency);
  }
  return DecimalMoney.fromDecimal(amount).format(currency);
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return 'Just now';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(d);
}
