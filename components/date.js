import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'


const locales = {ptBR};
export default function Date({ dateString }) {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, 'dd/MMM/yyyy', {locale: ptBR})}</time>;
  // return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>;
}