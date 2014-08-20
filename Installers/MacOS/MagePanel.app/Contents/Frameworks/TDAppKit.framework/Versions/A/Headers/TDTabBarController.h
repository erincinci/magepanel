//  Copyright 2010 Todd Ditchendorf
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <TDAppKit/TDViewController.h>

@class TDTabBar;
@protocol TDTabBarControllerDelegate;

@interface TDTabBarController : TDViewController

- (void)setViewControllers:(NSArray *)vcs animated:(BOOL)animated;

@property (nonatomic, readonly, retain) TDTabBar *tabBar; // Provided for -[UIActionSheet showFromTabBar:]. Attempting to modify the contents of the tab bar directly will throw an exception.
@property (nonatomic, retain) NSView *containerView;
@property (nonatomic, assign) id <TDTabBarControllerDelegate>delegate;
@property (nonatomic, copy) NSArray *viewControllers;
@property (nonatomic, retain) TDViewController *selectedViewController;
@property (nonatomic) NSUInteger selectedIndex;
@end

@protocol TDTabBarControllerDelegate <NSObject>
@optional
- (BOOL)tabBarController:(TDTabBarController *)tabBarController shouldSelectViewController:(TDViewController *)viewController;
- (void)tabBarController:(TDTabBarController *)tabBarController willSelectViewController:(TDViewController *)viewController;
- (void)tabBarController:(TDTabBarController *)tabBarController didSelectViewController:(TDViewController *)viewController;
@end
