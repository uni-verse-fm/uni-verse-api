export const mockUsers = [
    {
        _id: '0',
        username: '96abdou96',
        email: '96abdou96@gmail.com',
        password: "$2b$10$v5vECbZOx0ybssiOkrS/o.s7Q6ejf/bri2jwH8WW48trelGBdW3Mm",
    },
    {
        _id: '1',
        username: 'Vagahbond',
        email: 'Vagahbond@gmail.com',
        password: "$2b$10$v5vECbZOx0ybssiOkrS/o.s7Q6ejf/bri2jwH8WW48trelGBdW3Mm",
    },
    {
        _id: '2',
        username: 'Marx',
        email: 'marxou@gmail.com',
        password: "$2b$10$v5vECbZOx0ybssiOkrS/o.s7Q6ejf/bri2jwH8WW48trelGBdW3Mm",
    },
];


export const mockReleases = [
    {
        _id: '0',
        title: 'balck album',
        description: 'one of the greatest',
        coverUrl: 'https://www.black.com',
        author: mockUsers[0]
    },
    {
        _id: '1',
        title: 'how to pimp a butterfly',
        description: 'just legendary',
        coverUrl: 'https://www.pimp.com',
        author: mockUsers[0]
    },
    {
        _id: '2',
        title: '25',
        description: 'for diversity',
        coverUrl: 'https://www.25.com',
        author: mockUsers[1]
    },
];

export const mockCreateUser = {
    username: 'Picola',
    email: 'picola.le.vert@gmail.com',
    password: 'PicoLaMoula',
};

export const mockCreateResponse = {
    username: 'Picola',
    email: 'picola.le.vert@gmail.com',
};

export const mockLoginUser = {
    email: 'Vagahbond@gmail.com',
    password: 'VagaLaFrappe ',
};

export const mockLoginResponse = {
    username: 'Vagahbond',
    email: 'Vagahbond@gmail.com',
    jwt: '',
};
