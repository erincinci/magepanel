//
//  OKSourceEditViewController.h
//  PEGKit
//
//  Created by Todd Ditchendorf on 4/24/13.
//
//

#import <Cocoa/Cocoa.h>
#import <OkudaKit/OKSyntaxHighlighter.h>

@class OKTextView;
@class OKGutterView;

extern NSString * const OKTabWidthKey;
extern NSString * const OKConvertTabsToSpacesKey;
extern NSString * const OKAutocompletionEnabledKey;
extern NSString * const OKAutocompletionFuzzyMatchKey;
extern NSString * const OKAutocompletionDelayKey;
extern NSString * const OKCanAcceptCompletionDelayKey;

@class OKViewController;

@protocol OKViewControllerDelegate <NSObject>
@optional
- (BOOL)okviewController:(OKViewController *)okvc doCommandBySelector:(SEL)sel;
- (BOOL)okviewController:(OKViewController *)okvc shouldChangeTextInRange:(NSRange)affectedCharRange replacementString:(NSString *)replacementString;
@end

@interface OKViewController : NSViewController <NSTextViewDelegate, NSLayoutManagerDelegate, NSTableViewDataSource, NSTableViewDelegate>

- (id)initWithDefaultNib;

- (void)reloadStylesheets:(id)sender;
- (void)refresh:(id)sender;
- (void)renderGutterNow;
- (void)renderGutterLater;

- (void)highlightLineNumber:(NSUInteger)lineNum;

- (NSColor *)triggerBackgroundFlagColor;
- (NSColor *)triggerBackgroundRenderColor;

- (NSColor *)highlightFillColor;
- (NSColor *)highlightStrokeColor;

- (NSDictionary *)defaultAttributes;

- (void)moveBreakpointsAfterLine:(NSUInteger)lineNum by:(NSInteger)diff;
- (void)deleteBreakpointsInLineRange:(NSRange)lineRange;
- (void)captureBreakpointsForUndo;

- (void)setSourceString:(NSString *)str encoding:(NSStringEncoding)enc; // clearUndo=YES
- (void)setSourceString:(NSString *)str encoding:(NSStringEncoding)enc clearUndo:(BOOL)clearUndo;

- (void)setGrammarName:(NSString *)name attributeProvider:(id <OKSyntaxHighlighterAttributesProvider>)provider;

@property (nonatomic, assign) id <OKViewControllerDelegate>delegate;

@property (nonatomic, retain) IBOutlet OKTextView *textView;
@property (nonatomic, retain) IBOutlet OKGutterView *gutterView;

@property (nonatomic, retain, readonly) NSString *sourceString;
@property (nonatomic, assign, readonly) NSStringEncoding sourceStringEncoding;
@property (nonatomic, copy, readonly) NSString *grammarName;

@property (nonatomic, assign) BOOL hasGutterView; // default YES

@property (nonatomic, assign) BOOL useDefaultAttributes;
@property (nonatomic, assign) BOOL suppressHighlighting;
@property (nonatomic, assign) BOOL enableDefinitionLinking;

@property (nonatomic, retain) OKSyntaxHighlighter *highlighter;
@end
