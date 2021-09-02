import { GetStaticPaths, GetStaticProps } from 'next';
import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
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

  const lectureTime = post.data.content.reduce((acc: string[], cur) => {
    return acc.concat(RichText.asText(cur.body).split(' '));
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

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const { slug } = context.params;
  const response = await prismic.getByUID('post', String(slug), {});

  // TODO
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
