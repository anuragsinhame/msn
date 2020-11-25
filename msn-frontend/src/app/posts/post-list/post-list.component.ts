import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

// Custom Imports
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //     {title: 'First Post', content: 'Coneten1'},
  //     {title: 'Second Post', content: 'Coneten2'},
  //     {title: 'Third Post', content: 'Coneten3'},
  //     {title: 'Fourth Post', content: 'Coneten4'},
  // ];

  posts: Post[] = [];
  isLoading = false;

  // Pagintor variables
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 3, 5, 10];
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getUpdatedPostsListener()
      .subscribe((postsData: { posts: Post[], postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postsData.postCount;
        this.posts = postsData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onDeletePost(postId: string, pageData: PageEvent): void {
    this.isLoading = true;
    // console.log('Before deletion.\nCurrent Page:', this.currentPage, '\nTotal Posts:', this.totalPosts);
    this.postsService.deletePost(postId)
      // Added during pagination
      // We will subscribe to the Observable returned here
      .subscribe(() => {
        // console.log('Before del subs.\nCurrent Page:', this.currentPage, '\nTotal Posts:', this.totalPosts);
        // To be checked for No Posts yet display after deleting all the posts on the page
        // For now, redirecting to 1st page
        // updating the count of total posts locally
        // this.totalPosts -= 1;
        // if (this.totalPosts % this.postsPerPage === 0){
        //     this.currentPage = this.currentPage - 1;
        // }
        // console.log('After del subs.\nCurrent Page:', this.currentPage, '\nTotal Posts:', this.totalPosts);
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        // To be checked for No Posts yet display after deleting all the posts on the page
        // For now, redirecting to 1st page
        // this.postsService.getUpdatedPostsListener().
        // subscribe(postsData => {
        //     this.totalPosts = postsData.postCount;
        //     console.log('Inside UpdatedListener.\nCurrent Page:', this.currentPage, '\nTotal Posts:', this.totalPosts);
        // });
      });
  }

  onChangedPage(pageData: PageEvent): void {
    this.isLoading = true;
    // pageIndex starts at 0, but we are working as 1, 2..hence + 1
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
