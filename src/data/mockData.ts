const getAvatarUrl = (name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=112&background=random&color=fff&bold=true`;
};

export const mockContestants = [
  {
    id: 1,
    name: "Sarah Johnson",
    type: "Singer",
    votes: 245,
    image: getAvatarUrl("Sarah Johnson")
  },
  {
    id: 2,
    name: "Mike Chen",
    type: "Dancer",
    votes: 189,
    image: getAvatarUrl("Mike Chen")
  },
  {
    id: 3,
    name: "Emily Davis",
    type: "Magician",
    votes: 312,
    image: getAvatarUrl("Emily Davis")
  },
  {
    id: 4,
    name: "Alex Rivera",
    type: "Comedian",
    votes: 156,
    image: getAvatarUrl("Alex Rivera")
  },
  {
    id: 5,
    name: "Jessica Kim",
    type: "Musician",
    votes: 278,
    image: getAvatarUrl("Jessica Kim")
  },
  {
    id: 6,
    name: "David Thompson",
    type: "Juggler",
    votes: 134,
    image: getAvatarUrl("David Thompson")
  },
  {
    id: 7,
    name: "Maria Garcia",
    type: "Acrobat",
    votes: 223,
    image: getAvatarUrl("Maria Garcia")
  },
  {
    id: 8,
    name: "Chris Wilson",
    type: "Ventriloquist",
    votes: 167,
    image: getAvatarUrl("Chris Wilson")
  }
];