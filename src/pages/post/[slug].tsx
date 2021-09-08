import { GetStaticPaths, GetStaticProps } from 'next';
import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO

  const router = useRouter();
  const commentBoxRef = useRef<HTMLDivElement>(null);

  const lectureTime = post.data.content.reduce((acc: string[], cur) => {
    return acc.concat(RichText.asText(cur.body).split(' '));
  }, []);

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute('repo', 'alfredots/ignite-blog-do-zero');
    scriptEl.setAttribute('issue-term', 'url');
    scriptEl.setAttribute('theme', 'github-dark');
    commentBoxRef.current.appendChild(scriptEl);
  }, []);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Home | {post.data.title}</title>
      </Head>
      <main className={commonStyles.container}>
        <Header />
        <img
          className={styles.postBanner}
          src={post.data.banner.url}
          alt="thumbnail post"
        />
        <section className={`${styles.post} ${commonStyles.content}`}>
          <h1 className={styles.postTitle}>{post.data.title}</h1>
          <div className={styles.info}>
            <div>
              <time>
                <FaCalendar />
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FaUser />
                {post.data.author}
              </span>
              <span>
                <FaClock />
                {Math.floor(lectureTime.length / 150)} min
              </span>
            </div>
            <span>
              {format(
                new Date(post.first_publication_date),
                "'* editado em' dd MMM yyyy', às' HH:mm",
                {
                  locale: ptBR,
                }
              )}
            </span>
          </div>
          {post.data.content.map(item => {
            return (
              <>
                <h1 className={styles.postContentTitle}>{item.heading}</h1>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: String(RichText.asHtml(item.body)),
                  }}
                />
              </>
            );
          })}
          <div className={styles.otherPosts}>
            <div>
              <h3>Como utilizar Hooks</h3>
              <Link href="/">
                <a>Post anterior</a>
              </Link>
            </div>
            <div>
              <h3>Como utilizar Hooks</h3>
              <Link href="/">
                <a>Próximo post</a>
              </Link>
            </div>
          </div>
          <div ref={commentBoxRef} />
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // TODO
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  // TODO
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post, preview },
  };
};
