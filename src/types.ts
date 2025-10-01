type PostWithRelations = {
  id: string;
  authorId: string;
  content: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;

  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  };

  comments: {
    id: string;
    content: string | null;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
    };
  }[];

  likes: {
    userId: string;
  }[];

  _count: {
    likes: number;
    comments: number;
  };
};