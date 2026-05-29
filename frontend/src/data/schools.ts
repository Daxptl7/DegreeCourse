export const schools = [
    {
        id: 'sls',
        name: 'School of Liberal Studies',
        shortName: 'SLS',
        logo: '/SLS.png',
        link: '/school/sls',
        status: 'live',
    },
    {
        id: 'som',
        name: 'School of Management',
        shortName: 'SOM',
        logo: '/SOM.png',
        link: '/school/som',
        status: 'coming-soon',
    },
    {
        id: 'soet',
        name: 'School of Energy Technology',
        shortName: 'SOET',
        logo: '/SOET.png',
        link: '/school/soet',
        status: 'coming-soon',
    },
    {
        id: 'sot',
        name: 'School of Technology',
        shortName: 'SOT',
        logo: '/SOT.png',
        link: '/school/sot',
        status: 'coming-soon',
    },
];

export const schoolMap = schools.reduce((acc, school) => {
    acc[school.id] = school;
    return acc;
}, {});
