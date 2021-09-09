import { GetStaticProps } from 'next';
import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';

import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { useCallback } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  // TODO
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [pagination, setPagination] = useState(postsPagination.next_page);

  const onClickHandleMorePosts = useCallback(async () => {
    const response = await fetch(pagination);
    const responseJson = await response.json();

    const newPosts: Post[] = responseJson.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: post.data,
      };
    });
    setPosts([...posts, ...newPosts]);
    setPagination(responseJson.next_page);
  }, [posts, pagination]);
  return (
    <>
      <Head>Home | spacetraveling</Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={`${styles.posts} ${commonStyles.content}`}>
          {posts.map(post => (
            <Link key={post.uid} href={`post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>
                  <FaCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <FaUser />
                  {post.data.author}
                </span>
              </a>
            </Link>
          ))}
          {pagination && (
            <button
              type="button"
              onClick={onClickHandleMorePosts}
              className={styles.morePosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>
                <button type="button" className={commonStyles.previewButton}>
                  Sair do modo Preview
                </button>
              </a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: post.data,
    };
  });

  // TODO;
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
  };
};
