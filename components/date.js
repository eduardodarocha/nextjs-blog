import { parseISO, format } from 'date-fns';

export default function DateToken({ dateString }) {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    const formatted = format(date, 'yyyy.MM.dd');
    return <time dateTime={dateString}>[ {formatted} ]</time>;
  } catch (e) {
    return <time dateTime={dateString}>[ {dateString} ]</time>;
  }
}