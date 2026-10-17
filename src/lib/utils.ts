import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "TBA";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      // TMDB dates are calendar dates parsed as UTC midnight; reading them in
      // local time would show the day before in the Americas.
      ...(/^\d{4}-\d{2}-\d{2}$/.test(dateString) && { timeZone: "UTC" }),
    });
  } catch {
    return "Invalid Date";
  }
}

// Format year from date string
export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return (/^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? date.getUTCFullYear()
      : date.getFullYear()
    ).toString();
  } catch {
    return "";
  }
}

// Format runtime in minutes to hours and minutes
export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

// Format vote average to one decimal place
export function formatVoteAverage(
  voteAverage: number | null | undefined,
): string {
  if (!voteAverage && voteAverage !== 0) return "N/A";
  return voteAverage.toFixed(1);
}

// Format currency
export function formatCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Truncate text to specified length
export function truncateText(
  text: string | null | undefined,
  maxLength: number,
): string {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength).trim() + "...";
}

// Debounce function for search
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Calculate age from birth date
export function calculateAge(
  birthDate: string | null | undefined,
  deathDate?: string | null,
): number | null {
  if (!birthDate) return null;

  try {
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();

    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return null;
  }
}

// Generate Rotten Tomatoes search URL
export function getRottenTomatoesSearchUrl(
  title: string,
  year?: string,
): string {
  const query = year ? `${title} ${year}` : title;
  const encodedQuery = encodeURIComponent(query.trim());
  return `https://www.rottentomatoes.com/search?search=${encodedQuery}`;
}

// Extract US MPAA rating from release dates
export function getUSCertification(
  releaseDates:
    | {
        results?: Array<{
          iso_3166_1: string;
          release_dates?: Array<{
            certification?: string;
          }>;
        }>;
      }
    | null
    | undefined,
): string | null {
  if (!releaseDates?.results) return null;

  const usRelease = releaseDates.results.find(
    (result) => result.iso_3166_1 === "US",
  );

  if (!usRelease?.release_dates) return null;

  // Find the theatrical release (type 3) or any release with certification
  const certifiedRelease = usRelease.release_dates.find(
    (release) => release.certification && release.certification.trim(),
  );

  return certifiedRelease?.certification || null;
}

// Get MPAA rating color and styling
