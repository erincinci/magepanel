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

#import <Cocoa/Cocoa.h>

@class PKTokenizer;
@class OKTextView;

@protocol OKTextViewListDataSource <NSObject>
@required
- (NSString *)textView:(OKTextView *)tv completedString:(NSString *)uncompletedString;
- (NSUInteger)numberOfItemsInTextView:(OKTextView *)tv;
- (id)textView:(OKTextView *)tv objectAtIndex:(NSUInteger)i;
@optional
//- (NSUInteger)textView:(OKTextView *)tv indexOfItemWithStringValue:(NSString *)string;
@end

@protocol OKTextViewListDelegate <NSObject>
@required
- (BOOL)textView:(OKTextView *)tv writeDataToPasteboard:(NSPasteboard *)pboard;
@optional
- (void)textViewWillDismissPopUp:(OKTextView *)tv;

- (void)textView:(OKTextView *)tv wantsDocumentationForString:(NSString *)tokStr inRange:(NSRange)r;
- (void)textView:(OKTextView *)tv wantsHeaderSourceForString:(NSString *)tokStr inRange:(NSRange)r;
@end

@interface OKTextView : NSTextView <NSTableViewDataSource, NSTableViewDelegate>

// custom commands
- (void)increseIndentOnSelectedLines:(id)sender;
- (void)decreaseIndentOnSelectedLines:(id)sender;
- (void)toggleCommentsOnSelectedLines:(id)sender;
- (void)insertTerminatorAndNewline:(id)sender;

// returns total number of lines in text
- (NSUInteger)getRectsOfVisibleLines:(NSArray **)outRects startingLineNumber:(NSUInteger *)outStart;

- (NSRange)visibleRange;
- (NSRange)rangeOfLine:(NSUInteger)targetLineNum;
- (NSRect)visibleRectForLine:(NSUInteger)lineNum;
- (NSRect)rectForLine:(NSUInteger)lineNum;
- (NSUInteger)lineNumberForGlyphAtIndex:(NSUInteger)searchGlyphIdx;

- (NSString *)getCurrentLineRange:(NSRangePointer)outRange;
- (NSString *)getLineRange:(NSRangePointer)outRange inRange:(NSRange)selRange;

- (NSString *)getCurrentTokenRange:(NSRangePointer)outRange;
- (NSString *)getTokenRange:(NSRangePointer)outRange inRange:(NSRange)selRange;

- (BOOL)scrollRangeToVisibleIfHidden:(NSRange)inRange;

- (void)tk_replaceCharactersInRange:(NSRange)selLinesRange withString:(NSString *)newStr andSelectRange:(NSRange)newSelRange;
//- (void)tk_replaceCharactersInRange:(NSRange)selLinesRange withAttributedString:(NSAttributedString *)insAttrStr andSelectRange:(NSRange)newSelRange;

- (void)pushSuppressScrolling;
- (void)popSuppressScrolling;

@property (nonatomic, retain) PKTokenizer *tokenizer;
@property (nonatomic) NSUInteger highlightedLineNumber;

// Autocomplete
- (void)escape:(id)sender;

- (BOOL)isListVisible;
- (void)removeListWindow;

- (NSRect)listWindowRectForBounds:(NSRect)bounds;
- (NSRect)listViewRectForBounds:(NSRect)bounds;

@property (nonatomic, assign) id <OKTextViewListDataSource>listDataSource;
@property (nonatomic, assign) id <OKTextViewListDelegate>listDelegate;
@property (nonatomic, retain) NSScrollView *listScrollView;
@property (nonatomic, retain) NSTableView *listView;
@property (nonatomic, retain) NSWindow *listWindow;
@property (nonatomic, assign) BOOL canAcceptCompletion;
@property (nonatomic, assign) NSRange currentCompletionRange;
@property (nonatomic, assign) BOOL enableDefinitionLinking;
@end
