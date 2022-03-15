import { Random } from '../classes/Random';
import { SeedI } from '../types';

export const FIRST_NAMES_M = `
	Paul, Paolo, Pablo, Pavel, Pasha, Pau, Paulo, Pol, Pavlo, Paavo, Pali, Pal, Paulin, Pava, Påvel, Paulino, Pawel,
	Paavali, Pauel, Pavlos, Pavlusha, Poul, Pusha, Pashenka, Pavlík, Poll, Pól, Pavlousek, Pawelek, Pål, Pavilcek, Pál
`
	.replace(/\t|\n/g, '')
	.split(',')
	.map(name => name.trim());

export const FIRST_NAMES_F = `
	Mia, Mare, Miriam, Mary, Mara, Molly, Maren, Mariah, Marisol, Maria, Moira, Polly, Marie, Mariana, Marilyn, Malia,
	Mari, Manon, Marissa, Mariam, Marion, Ria, Mariella, Milou, Mitzi, Marielle, Maribel, Maura, Mamie, Maureen, Mariel,
	Marisa, Maryam, Mairi, Malou, Marietta, Maija, Maire, Maritza, Maricela, Marya, Marika, Isamar, My, Mariska, Maryse,
	Mariela, Maira, Marita, Mariette,
`
	.replace(/\t|\n/g, '')
	.split(',')
	.map(name => name.trim());

const SETTLEMENT_PREFIXES = ['Tool', 'Rap', 'Murder', 'Thief', 'Apple', 'Banana', 'Copy', 'Cop'];
const SETTLEMENT_SUFFIXES = [
	'town',
	' Town',
	'ville',
	'burgh',
	'burough',
	'view',
	'wall',
	'beach',
	'acre'
];
export function getRandomSettlementName(seed: SeedI[]) {
	return [
		Random.fromArray(SETTLEMENT_PREFIXES, ...seed, 1),
		Random.fromArray(SETTLEMENT_SUFFIXES, ...seed, 2)
	].join('');
}
