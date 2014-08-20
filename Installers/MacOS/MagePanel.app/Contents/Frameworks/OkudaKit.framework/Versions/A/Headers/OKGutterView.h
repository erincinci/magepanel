//  Copyright 2009 Todd Ditchendorf
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

#import "OKView.h"

@class OKGutterView;
@class OKBreakpoint;

@protocol OKGutterViewDelegate <NSObject>
- (void)captureBreakpointsForUndoInGutterView:(OKGutterView *)gv;
- (void)gutterView:(OKGutterView *)gv didAddBreakpoint:(OKBreakpoint *)bp;
- (void)gutterView:(OKGutterView *)gv didRemoveBreakpoint:(OKBreakpoint *)bp;
- (void)gutterView:(OKGutterView *)gv didToggleBreakpoint:(OKBreakpoint *)bp;
- (NSString *)filePathForGutterView:(OKGutterView *)gv;
- (NSDictionary *)breakpointsForGutterView:(OKGutterView *)gv;
- (BOOL)breakpointsEnabledForGutterView:(OKGutterView *)gv;
- (NSDictionary *)defaultAttributesForGutterView:(OKGutterView *)gv;
@end

@interface OKGutterView : OKView <NSDraggingSource>
+ (CGFloat)marginLeft;
+ (CGFloat)marginRight;
+ (CGFloat)fontSize;
+ (CGSize)columnSize;

- (void)moveBreakpointsAfterLine:(NSUInteger)lineNum by:(NSInteger)diff;
- (void)deleteBreakpointsInLineRange:(NSRange)lineRange;
- (void)captureBreakpointsForUndo;

@property (nonatomic, assign) id <OKGutterViewDelegate>delegate; // weakref
@property (nonatomic, assign) NSUInteger minimumNumberOfColumns;
@property (nonatomic) NSUInteger highlightedLineNumber;
@property (nonatomic, retain) NSColor *borderColor;
@end
