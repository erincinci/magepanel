//
//  OKTrigger.h
//  OkudaKit
//
//  Created by Todd Ditchendorf on 7/9/13.
//
//

#import <Foundation/Foundation.h>

@interface OKTrigger : NSObject <NSCopying>

+ (OKTrigger *)triggerWithTemplate:(NSString *)t;
+ (OKTrigger *)triggerWithTemplate:(NSString *)t specifier:(NSString *)spec;

+ (OKTrigger *)triggerWithString:(NSString *)str ranges:(NSArray *)ranges;
+ (OKTrigger *)triggerWithString:(NSString *)str ranges:(NSArray *)ranges specifier:(NSString *)spec;

- (id)initWithString:(NSString *)str ranges:(NSArray *)ranges specifier:(NSString *)spec;

@property (nonatomic, copy) NSString *string;
@property (nonatomic, copy) NSString *specifier;
@property (nonatomic, assign) CGFloat score;
@property (nonatomic, assign) BOOL wantsExactMatch;
@property (nonatomic, assign) NSUInteger offset;

- (BOOL)hasMoreRanges;
- (NSRange)nextRange;

- (BOOL)isFirst;
- (BOOL)isLast;
- (void)reset;

- (void)setNextRangeLocation:(NSUInteger)newLoc;
- (void)incrementNextRangeLocationBy:(NSUInteger)inc;
@end
