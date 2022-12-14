import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Button from '../Button/Button';
import Commentaries from '../Commentaries/Commentaries';
import styles from './commentBlock.module.scss';
import { commentSchemaValidate } from '../../utils/validateSchema/validateSchema';
import { useAppSelector } from '../../redux/store';
import { CommentBlockProp } from './types';
import CommentariesSkeleton from '../Commentaries/CommentariesSkeleton';
import EmptyCommentaries from '../Commentaries/EmptyCommentaries/EmptyCommentaries';
import scrollTo from '../../utils/scrollTo';
import {
    useAddCommentMutation,
    useEditCommentMutation,
    useRemoveCommentMutation,
} from '../../redux/slices/posts/commentApi';
import { useGetCommentQuery } from '../../redux/slices/posts/baseApi';
const ErrorComment = lazy(() => import('../Error/RightBarError/RightBarError'));

const CommentBlock: React.FC<CommentBlockProp> = ({ postId }) => {
    const [areaValue, setAreaValue] = useState('');
    const [idEditComment, setIdEditComment] = useState<string | null>(null);
    const [validComment, setValidMessage] = useState<boolean>(true);
    const refArea = useRef<HTMLTextAreaElement>(null);
    const ref = useRef<HTMLElement>(null);
    const { isAuth, user } = useAppSelector((store) => store.auth);
    const { data, isLoading: commentLoading, isError } = useGetCommentQuery(postId);
    const [addComment, { isLoading }] = useAddCommentMutation();
    const [removeComment] = useRemoveCommentMutation();
    const [getEditComment] = useEditCommentMutation();

    const validateAndChange = (e: string): void => {
        setAreaValue(e);
        commentSchemaValidate
            .isValid({
                comment: e,
            })
            .then((res) => setValidMessage(!res));
    };

    const remove = (commentId: string, postId: string) => {
        if (window.confirm('Confirm comment deletion?')) {
            removeComment({ id: commentId, postId });
        }
    };

    const submit = (e: React.SyntheticEvent<EventTarget>) => {
        e.preventDefault();
        if (user && !idEditComment) {
            addComment({
                userId: user?._id,
                postId,
                text: areaValue,
            });
        } else if (idEditComment) {
            getEditComment({ id: idEditComment, text: areaValue });
            setIdEditComment(null);
        }

        if (!isLoading) {
            setAreaValue('');
            setValidMessage(true);
        }
    };

    const edit = (text: string, commentId: string) => {
        setIdEditComment(commentId);
        setAreaValue(text);
        setValidMessage(false);
        scrollTo(ref);
    };

    const areaFocus = () => {
        if (refArea && refArea.current) {
            refArea.current.focus();
        }
    };

    const calcHeightArea = (): void => {
        if (refArea && refArea.current) {
            refArea.current.style.height = '0px';
            const scrollHeight = refArea.current.scrollHeight;
            refArea.current.style.height = scrollHeight + 'px';
        }
    };

    useEffect(() => {
        calcHeightArea();
    }, [areaValue]);

    const addCommentDisabled = () => {
        if (!isAuth || isError) {
            return true;
        }
        return false;
    };

    const commentRender = commentLoading
        ? [...new Array(3)].map((_, i) => <CommentariesSkeleton key={i} />)
        : data?.map((item) => (
              <Commentaries
                  key={item._id}
                  props={{ ...item, edit, remove }}
                  edit={item.user._id === user?._id}
              />
          ));
    const comment = data?.length === 0 ? <EmptyCommentaries /> : commentRender;
    const commentError = isError ? (
        <Suspense fallback={<CommentariesSkeleton />}>
            <ErrorComment />
        </Suspense>
    ) : null;

    return (
        <section className={styles.comment} ref={ref}>
            <form onSubmit={submit}>
                <h3>Commentaries</h3>
                <div
                    className={`${styles.areaWrapper} ${addCommentDisabled() && styles.disabled}`}
                    onClick={areaFocus}>
                    <textarea
                        disabled={addCommentDisabled()}
                        ref={refArea}
                        rows={1}
                        name='comment'
                        onChange={(e) => validateAndChange(e.target.value)}
                        value={areaValue}
                        placeholder={
                            isAuth ? 'Please enter your comment' : 'Please log in to comment'
                        }
                    />
                    <p></p>
                    <div>
                        <Button
                            loading={isLoading}
                            text={'Add'}
                            disabled={validComment}
                            type='submit'
                        />
                    </div>
                </div>
            </form>
            <div>
                {comment}
                {commentError}
            </div>
        </section>
    );
};
export default CommentBlock;
