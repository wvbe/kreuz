const FIRST_NAMES_M = `
	Paul, Paolo, Pablo, Pavel, Pasha, Pau, Paulo, Pol, Pavlo, Paavo, Pali, Pal, Paulin, Pava, Påvel, Paulino, Pawel,
	Paavali, Pauel, Pavlos, Pavlusha, Poul, Pusha, Pashenka, Pavlík, Poll, Pól, Pavlousek, Pawelek, Pål, Pavilcek, Pál
`
	.replace(/\t|\n/g, '')
	.split(',')
	.map(name => name.trim());

const FIRST_NAMES_F = `
	Mia, Mare, Miriam, Mary, Mara, Molly, Maren, Mariah, Marisol, Maria, Moira, Polly, Marie, Mariana, Marilyn, Malia,
	Mari, Manon, Marissa, Mariam, Marion, Ria, Mariella, Milou, Mitzi, Marielle, Maribel, Maura, Mamie, Maureen, Mariel,
	Marisa, Maryam, Mairi, Malou, Marietta, Maija, Maire, Maritza, Maricela, Marya, Marika, Isamar, My, Mariska, Maryse,
	Mariela, Maira, Marita, Mariette,
`
	.replace(/\t|\n/g, '')
	.split(',')
	.map(name => name.trim());

export function getRandomMaleFirstName() {
	return FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)];
}
export function getRandomFemaleFirstName() {
	return FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)];
}

export function getRandomFullName() {}
